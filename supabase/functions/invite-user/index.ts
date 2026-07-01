import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

    // Create a Supabase client with the service role key to bypass RLS and use Admin API
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an ADMIN
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) throw new Error('Invalid token');

    // Check if user is an admin in profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can invite users');
    }

    // Parse request body
    const { email, companyId } = await req.json();

    if (!email || !companyId) {
      throw new Error('Missing required fields: email or companyId');
    }

    // Invite the user
    // This sends an invite email and creates the auth.users record
    const { data: invitedUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      throw inviteError;
    }

    // Note: The profile row might be auto-created by a Postgres trigger on auth.users if you have one.
    // If not, we should insert it here. But since we need to set companyId, we will upsert it.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: invitedUser.user.id,
        company_id: companyId,
        role: 'CUSTOMER',
      });

    if (profileError) {
      throw profileError;
    }

    return new Response(
      JSON.stringify({ message: 'User invited successfully', user: invitedUser.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
