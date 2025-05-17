import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

//ーストレージから状態を安全に解析するヘルパー
const safelyParseJSON = (jsonString: string | undefined, storeName: string) => {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed.state; // Zustand persistミドルウェアは通常 'state' プロパティ以下に状態を保存
  } catch (e) {
    console.warn(`ミドルウェア: ${storeName} Cookieのパースに失敗:`, e);
    return null;
  }
};

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ // response を let で宣言
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // responseインスタンスのcookiesにセットする
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // responseインスタンスのcookiesから削除する
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { user } = session || { user: null };

  const currentPath = req.nextUrl.pathname;

  const publicPaths = [
    '/login',
    '/register',
    '/api/auth/callback', // Supabaseのコールバックパスなど
    // 静的アセットやNext.js内部パスは除外
    '/_next',
    '/favicon.ico',
    '/logo.svg',
    '/manifest.json',
    '/icons',
  ];

  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

  // ログインしていないユーザーの処理
  if (!user) {
    if (isPublicPath) {
      return response; // パブリックパスならそのまま表示
    }
    // パブリックでないパスへのアクセスはログインページへリダイレクト
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // --- ログイン済みユーザーの処理 ---

  // ログインページや登録ページにアクセスしようとした場合は、家計簿選択ページにリダイレクト
  if (currentPath === '/login' || currentPath === '/register') {
    return NextResponse.redirect(new URL('/wallet/select', req.url));
  }
  
  // ルートパス('/')へのアクセスも家計簿選択ページにリダイレクト（後続のロジックで適切なページに再リダイレクトされる）
  if (currentPath === '/'){
    return NextResponse.redirect(new URL('/wallet/select', req.url));
  }

  // DBからユーザーの multiple_wallets 設定を取得
  let dbMultiWalletEnabled = true; // デフォルトは複数可
  if (user) { // userがnullでないことを確認
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('multiple_wallets')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('ミドルウェア: DBからのユーザープロファイル取得エラー:', profileError.message);
      } else if (userProfile) {
        dbMultiWalletEnabled = userProfile.multiple_wallets;
        console.log(`ミドルウェア: DBから取得した userProfile: ${JSON.stringify(userProfile)}`);
        console.log(`ミドルウェア: DBから取得した multiple_wallets の値: ${userProfile.multiple_wallets}, 型: ${typeof userProfile.multiple_wallets}`);
      } else {
        console.warn(`ミドルウェア: ユーザーID ${user.id} のプロファイルがDBに見つかりません。`);
      }
    } catch (e: any) {
      console.error('ミドルウェア: DBアクセス中に予期せぬエラー:', e.message);
    }
  }

  // Cookieの値も読み取るが、DBの値を優先する
  const userSettingsCookie = req.cookies.get('user-settings-storage')?.value;
  const userSettings = safelyParseJSON(userSettingsCookie, 'user-settings-storage');
  // DBから取得した値を主とし、取得できなかった場合はCookieの値、それもなければデフォルト
  const isMultiWalletEnabled = dbMultiWalletEnabled ?? userSettings?.isMultiWalletEnabled ?? true;
  console.log(`ミドルウェア: isMultiWalletEnabled の決定ロジック: dbMultiWalletEnabled (${dbMultiWalletEnabled}, 型: ${typeof dbMultiWalletEnabled}) ?? userSettings?.isMultiWalletEnabled (${userSettings?.isMultiWalletEnabled}) ?? true`);
  console.log(`ミドルウェア: 最終的な isMultiWalletEnabled: ${isMultiWalletEnabled}`);

  const walletStoreCookie = req.cookies.get('wallet-storage')?.value;
  const walletState = safelyParseJSON(walletStoreCookie, 'wallet-storage');
  const activeWalletId = walletState?.activeWalletId;
  const wallets = walletState?.wallets || [];
  const hasWallets = wallets.length > 0;
  console.log(`ミドルウェア: activeWalletId の値: ${activeWalletId}`);

  // 画面一覧.md の「起動時自動遷移ロジック」に基づく遷移
  // (実際には /wallet/select や /wallet へのアクセス時にこのロジックが評価される)
  if (currentPath.startsWith('/wallet')) {
    // 1. 家計簿がない場合 -> /wallet/select (家計簿作成を促す)
    if (!hasWallets) {
      if (currentPath !== '/wallet/select' && currentPath !== '/wallet/create') {
        return NextResponse.redirect(new URL('/wallet/select', req.url));
      }
    } else {
      // 2. 家計簿があり、複数家計簿参加設定 or アクティブな家計簿がない -> /wallet/select
      if (isMultiWalletEnabled || !activeWalletId) {
        if (currentPath !== '/wallet/select' && currentPath !== '/wallet/create') {
          // アクティブウォレットがない場合、選択画面へ
          // ただし、既に選択画面や作成画面にいる場合はそのまま
          if(!activeWalletId && currentPath !== '/wallet/select'){
             return NextResponse.redirect(new URL('/wallet/select', req.url));
          }
        }
      } else {
        // 3. 家計簿があり、単一家計簿設定で、アクティブな家計簿がある -> /wallet (家計簿ホームへ)
        // (アクティブウォレットIDが設定されている前提)
        if (currentPath !== '/wallet' && !currentPath.startsWith('/wallet/')) {
            // /wallet 以外の /wallet* へのアクセスや、/wallet/(サブパス) へのアクセスは許可
            // /wallet/select などは上の条件で処理されるので、ここに来るのは /wallet へのリダイレクトが期待されるケース
        } else if (currentPath === '/wallet/select') {
            // 単一設定でアクティブウォレットがあるのに選択画面にいる場合はホームへ
            return NextResponse.redirect(new URL('/wallet', req.url));
        }
      }
    }
  }
  
  // /user/settings へのアクセスは許可
  if (currentPath.startsWith('/user/settings')) {
    return response;
  }

  // supabaseのセッション更新のために、最終的にresponseを返す
  // https://supabase.com/docs/guides/auth/server-side/nextjs#auth-with-nextjs-middleware
  return response; 
}

export const config = {
  matcher: [
    // すべてのパスに適用するが、APIルート、Next.js内部パス、静的ファイルは除外
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|manifest.json|icons/).*)',
  ],
}; 