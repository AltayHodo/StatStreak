import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://baxzomucageuiyxkqqnx.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheHpvbXVjYWdldWl5eGtxcW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjIyODIsImV4cCI6MjA2NjI5ODI4Mn0.A6nE22THd3mWhF8czm7XoFN1objxHQHk6AcUVjZ5cg8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);