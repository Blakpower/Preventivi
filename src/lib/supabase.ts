import { createClient } from '@supabase/supabase-js';

// These should be in environment variables in a real app
const supabaseUrl = 'https://szzcfuytachorchfbsvp.supabase.co';
const supabaseKey = 'sb_publishable_rm4U8v4NJ8ArnShVv1oj7Q_HGjXvZS2';

export const supabase = createClient(supabaseUrl, supabaseKey);
