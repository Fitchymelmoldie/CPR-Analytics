const defaultOrigins = [
  'https://bodyshop-dashboard.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const configuredOrigins = Deno.env.get('ALLOWED_ORIGINS')
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean) ?? [];
const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultOrigins;

const previewOriginPattern = /^https:\/\/bodyshop-dashboard-[a-z0-9-]+-cpr-analytics\.vercel\.app$/;
const allowedOriginFor = (origin: string | null) => origin && (allowedOrigins.includes(origin) || previewOriginPattern.test(origin))
  ? origin
  : allowedOrigins[0] ?? defaultOrigins[0];

const corsFor = (origin: string | null) => ({
  'Access-Control-Allow-Origin': allowedOriginFor(origin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsHeaders = corsFor(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.3');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Create a Supabase client with the service role key to bypass RLS and use Admin API
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an ADMIN
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    if (!authHeader.startsWith('Bearer ')) throw new Error('Invalid Authorization header');
    const token = authHeader.slice('Bearer '.length).trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) throw new Error('Invalid token');

    // Check if user is an admin in profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can delete users');
    }

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('Missing required field: userId');
    }

    if (userId === user.id) {
      throw new Error('You cannot delete yourself.');
    }

    // Explicitly delete from profiles table first (in case there's no cascade delete configured)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (profileError) {
      console.error("Profile deletion failed:", profileError);
      // We proceed anyway to ensure auth user gets deleted.
    }

    // Execute admin deleteUser on the auth.users table
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'User deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const status = /Unauthorized:/.test(error.message || '')
      ? 403
      : /Invalid token|Missing Authorization|Invalid Authorization/.test(error.message || '')
        ? 401
      : /Missing required field|cannot delete yourself/.test(error.message || '')
        ? 400
        : 500;
    return new Response(JSON.stringify({ error: error.message || 'Delete failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });
  }
});
