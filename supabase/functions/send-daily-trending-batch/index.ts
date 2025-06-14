
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily trending email batch...');
    
    // Fetch trending movies from TMDB
    const tmdbResponse = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=8265bd1679663a7ea12ac168da84d2e8`);
    const tmdbData = await tmdbResponse.json();
    const trendingMovies = tmdbData.results?.slice(0, 8) || [];
    
    console.log(`Found ${trendingMovies.length} trending movies`);

    // Get all active email subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('frequency', 'daily');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active subscriptions found',
        sent: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send emails to all subscribers
    let sentCount = 0;
    const failedEmails: string[] = [];

    for (const subscription of subscriptions) {
      try {
        // Get user profile for personalization
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', subscription.user_id)
          .single();

        const userName = profile?.full_name || profile?.username || subscription.email.split('@')[0];

        // Send individual email using existing function
        const emailResponse = await supabase.functions.invoke('send-trending-email', {
          body: {
            email: subscription.email,
            name: userName,
            trendingMovies: trendingMovies
          }
        });

        if (emailResponse.error) {
          console.error(`Failed to send email to ${subscription.email}:`, emailResponse.error);
          failedEmails.push(subscription.email);
        } else {
          sentCount++;
          console.log(`Successfully sent email to ${subscription.email}`);
          
          // Update last_sent_at
          await supabase
            .from('email_subscriptions')
            .update({ 
              last_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);
        }
      } catch (error) {
        console.error(`Error processing subscription for ${subscription.email}:`, error);
        failedEmails.push(subscription.email);
      }
    }

    console.log(`Email batch complete. Sent: ${sentCount}, Failed: ${failedEmails.length}`);

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      failed: failedEmails.length,
      failedEmails: failedEmails,
      totalSubscriptions: subscriptions.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in daily trending batch:", error);
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
