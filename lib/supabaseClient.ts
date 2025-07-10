// /lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';
import { Database } from '../types'; // Import the new Database interface

let supabaseInstance: SupabaseClient<Database> | null = null;

// Check if the credentials are provided and are not the placeholder values.
const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_SUPABASE_URL');

if (isConfigured) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // Log a clear warning for the developer, but don't crash the app.
    // Components that depend on `supabase` should handle the null case.
    console.warn(
        "Supabase client not initialized. " +
        "Please configure SUPABASE_URL and SUPABASE_ANON_KEY in /lib/supabaseConfig.ts. " +
        "The application will run in a disconnected state."
    );
}

export const supabase = supabaseInstance;