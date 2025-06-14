
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common ad-serving domains to block
const adDomains = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'amazon-adsystem.com',
  'adsystem.amazon.com',
  'facebook.com/tr',
  'google-analytics.com',
  'googletagmanager.com',
  'outbrain.com',
  'taboola.com',
  'adsrvr.org',
  'rubiconproject.com',
  'adsystem.amazon.co.uk',
  'casalemedia.com',
  'openx.net',
  'pubmatic.com',
  'contextweb.com',
  'bidswitch.net',
  'rlcdn.com',
  'smartadserver.com',
  'criteo.com',
  'adnxs.com',
  'scorecardresearch.com'
];

// Ad-related URL patterns to block
const adPatterns = [
  /\/ads\//,
  /\/ad\//,
  /\/advertising\//,
  /\/advertisement\//,
  /\/sponsor\//,
  /\/tracking\//,
  /\/analytics\//,
  /\/metrics\//,
  /\/beacon\//,
  /\/pixel\//,
  /\.ads\./,
  /ads\./,
  /ad-/,
  /adsystem/,
  /googleads/,
  /googlesyndication/
];

const isAdRequest = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check if domain is in ad domains list
    if (adDomains.some(domain => urlObj.hostname.includes(domain))) {
      return true;
    }
    
    // Check if URL matches ad patterns
    if (adPatterns.some(pattern => pattern.test(url))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    const userId = url.searchParams.get('user_id');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has active subscription for ad-free experience
    let hasAdFreeAccess = false;
    if (userId) {
      const { data: subscription } = await supabase
        .from('email_subscriptions')
        .select('is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      hasAdFreeAccess = !!subscription;
    }

    // If it's an ad request and user has ad-free access, block it
    if (hasAdFreeAccess && isAdRequest(targetUrl)) {
      console.log(`Blocked ad request for user ${userId}: ${targetUrl}`);
      return new Response('', {
        status: 204,
        headers: corsHeaders
      });
    }

    // Proxy the request
    const targetRequest = new Request(targetUrl, {
      method: req.method,
      headers: new Headers({
        'User-Agent': req.headers.get('User-Agent') || 'FlickPick-Proxy/1.0',
        'Referer': req.headers.get('Referer') || '',
        'Accept': req.headers.get('Accept') || '*/*',
        'Accept-Language': req.headers.get('Accept-Language') || 'en-US,en;q=0.9',
      }),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    });

    const response = await fetch(targetRequest);
    
    // Clone the response to modify headers
    const responseHeaders = new Headers(response.headers);
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // Add cache control for streaming content
    if (response.headers.get('content-type')?.includes('video/') || 
        response.headers.get('content-type')?.includes('application/vnd.apple.mpegurl')) {
      responseHeaders.set('Cache-Control', 'public, max-age=3600');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error("Error in stream proxy:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
