import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwdnxjqxovxyubxdrsqf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13ZG54anF4b3Z4eXVieGRyc3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTIyMTEsImV4cCI6MjA2ODMyODIxMX0.qw7xLShh4DVc0rwng9QRTz9JvRijkIh885To22UQ4Pg'

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
