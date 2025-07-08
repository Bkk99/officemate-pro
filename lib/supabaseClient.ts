// /lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { Database } from '../types'; // Import the new Database interface

let supabaseInstance: SupabaseClient<Database> | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase credentials are not configured. Please check /lib/supabaseConfig.ts");
}

export const supabase = supabaseInstance;
