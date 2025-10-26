import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreviewRequest {
  token: string;
  type: 'portfolio_company' | 'news_article';
  id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, type, id }: PreviewRequest = await req.json();

    if (!token || !type || !id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: token, type, id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Preview request: type=${type}, id=${id}, token=${token.substring(0, 8)}...`);

    // Validate preview token
    const { data: isValid, error: validationError } = await supabase.rpc('validate_preview_token', {
      p_token: token,
      p_resource_type: type,
      p_resource_id: id,
    });

    if (validationError || !isValid) {
      console.error('Token validation failed:', validationError);
      
      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'INVALID_PREVIEW_TOKEN_ATTEMPT',
        severity: 'medium',
        details: {
          resource_type: type,
          resource_id: id,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent'),
        },
      });

      return new Response(
        JSON.stringify({ error: 'Invalid or expired preview token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch content based on type (bypassing RLS with service role)
    let data, error;

    if (type === 'portfolio_company') {
      const result = await supabase
        .from('portfolio_companies')
        .select('*')
        .eq('id', id)
        .single();
      
      data = result.data;
      error = result.error;
    } else if (type === 'news_article') {
      const result = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      console.error('Error fetching content:', error);
      return new Response(
        JSON.stringify({ error: 'Content not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get token info for response
    const { data: tokenInfo } = await supabase
      .from('preview_tokens')
      .select('expires_at, accessed_count')
      .eq('token', token)
      .single();

    // Log successful preview access
    await supabase.from('security_events').insert({
      event_type: 'PREVIEW_CONTENT_ACCESSED',
      severity: 'info',
      details: {
        resource_type: type,
        resource_id: id,
        status: data.status,
        accessed_count: tokenInfo?.accessed_count || 0,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    console.log(`Preview content delivered: status=${data.status}, accessed=${tokenInfo?.accessed_count || 0} times`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...data,
          preview_mode: true,
        },
        preview_info: {
          expires_at: tokenInfo?.expires_at,
          accessed_count: tokenInfo?.accessed_count || 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Preview content error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
