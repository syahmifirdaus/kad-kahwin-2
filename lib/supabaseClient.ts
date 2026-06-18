import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://lufcnosckeepwxhdzzzz.supabase.co";
const fallbackSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZmNub3Nja2VlcHd4aGR6enp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDI3MzIsImV4cCI6MjA5NzI3ODczMn0.4AKxgeC03zt4lPX9i339kyvBZzmYZOi7Sw8-zSdhuzg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

const missingSupabaseEnv = !supabaseUrl || !supabaseAnonKey;

if (missingSupabaseEnv && typeof window !== "undefined") {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
