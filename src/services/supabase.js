import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surface a visible error in the browser instead of a silent black screen
  if (typeof document !== "undefined") {
    document.body.style.cssText =
      "margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0f1e;font-family:monospace;color:#f87171;text-align:center;padding:2rem;";
    document.body.innerHTML =
      '<div><h2 style="font-size:1.4rem;margin-bottom:0.75rem">⚠ Configuration Error</h2><p>Supabase environment variables are not set.<br/>Add <code style="background:#1e293b;padding:2px 6px;border-radius:4px">VITE_SUPABASE_URL</code> and <code style="background:#1e293b;padding:2px 6px;border-radius:4px">VITE_SUPABASE_ANON_KEY</code> in your Vercel project settings and redeploy.</p></div>';
  }
  throw new Error(
    "Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
