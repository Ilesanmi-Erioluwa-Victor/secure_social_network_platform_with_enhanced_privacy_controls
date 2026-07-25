const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn('Supabase credentials not configured. File uploads will fail.');
}

const supabase = createClient(
  config.supabaseUrl || '',
  config.supabaseServiceKey || ''
);

module.exports = supabase;
