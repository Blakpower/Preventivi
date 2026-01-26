import { createClient } from '@supabase/supabase-js';

// These should be in environment variables in a real app
const supabaseUrl = 'https://szzcfuytachorchfbsvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6emNmdXl0YWNob3JjaGZic3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjUyMTAsImV4cCI6MjA4NDY0MTIxMH0.TwjvmIg43syQgClFAo0XjeUf195Minw761LF00xtgzY';

export const supabase = createClient(supabaseUrl, supabaseKey);
