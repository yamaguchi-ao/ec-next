// supabase client
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw Error("supabaseの設定が出来ていません。");
}

if (!supabaseAnonKey) {
    throw Error("supabaseの設定が出来ていません。");
}

type SupabaseClientSingleton = ReturnType<typeof supabaseClientSingleton>;

const globalForSupabase = global as unknown as {
    supabase: SupabaseClientSingleton | undefined;
}

const supabaseClientSingleton = () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
}

const supabase = globalForSupabase.supabase ?? supabaseClientSingleton();

export default supabase;

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;