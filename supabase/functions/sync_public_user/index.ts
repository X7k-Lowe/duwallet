import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record: newUser } = await req.json();

    if (!newUser || !newUser.id) {
      console.error("Invalid user data received from trigger:", newUser);
      return new Response(JSON.stringify({ error: "Invalid user data" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userId = newUser.id;
    const userMetaData = newUser.raw_user_meta_data || {};

    const userName = userMetaData.user_name || newUser.email?.split("@")[0] || "New User"; // デフォルト名
    const gender = userMetaData.gender || null;
    const multipleWallets = typeof userMetaData.multiple_wallets === 'boolean' ? userMetaData.multiple_wallets : false; // デフォルト false

    const { data, error } = await supabaseAdminClient
      .from("users")
      .insert({
        id: userId,
        name: userName,
        gender: gender,
        multiple_wallets: multipleWallets,
        // created_at と updated_at はDBのデフォルト値が使用される
      })
      .select();

    if (error) {
      console.error("Error inserting into public.users:", error);
      throw error;
    }

    console.log("Successfully synced user to public.users:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in sync_public_user function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 