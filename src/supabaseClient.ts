import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Verifique se a URL e a Key estão entre aspas e sem espaços
const supabaseUrl: string = "https://umqqizaxubdldidxsacx.supabase.co";

// ESTA CHAVE DEVE SER A "ANON PUBLIC" (aquela bem comprida)
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcXFpemF4dWJkbGRpZHhzYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDgyNjAsImV4cCI6MjA4NjkyNDI2MH0.yD2A6otC0IOua72V4R8bxemp7Ak_Jsaceu2BEL_0NRE"; 

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);