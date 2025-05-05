'use client';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1>DUWALLET</h1>
      <p>Loading...</p>
    </div>
  );
}

// T-02時点では以下のようにしていた
// import React from 'react';

// export default function Home() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center p-4">
//       <h1 className="mb-6 text-4xl font-bold">DUWallet</h1>
//       <p className="mb-8 text-xl">複数ユーザーが共同で管理する家計簿アプリ</p>
//       <div className="space-x-4">
//         <a
//           href="/login"
//           className="rounded-md bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark"
//         >
//           ログイン
//         </a>
//         <a
//           href="/signup"
//           className="rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-gray-50"
//         >
//           アカウント作成
//         </a>
//       </div>
//     </div>
//   );
// }
