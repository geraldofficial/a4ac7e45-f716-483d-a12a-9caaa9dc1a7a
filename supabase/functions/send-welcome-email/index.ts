
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();
    const userName = name || email.split('@')[0];

    const emailResponse = await resend.emails.send({
      from: "FlickPick <onboarding@resend.dev>",
      to: [email],
      subject: "🎬 Welcome to FlickPick - Your Ultimate Streaming Experience!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to FlickPick</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎬 FlickPick</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Ultimate Streaming Destination</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${userName}! 🍿</h2>
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Get ready for an incredible streaming experience! FlickPick brings you unlimited access to the best movies and TV shows from around the world.
              </p>

              <div style="background: #f8f9ff; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">🚀 What's waiting for you:</h3>
                <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Thousands of movies and TV series</li>
                  <li>Personalized recommendations</li>
                  <li>HD streaming with smooth playback</li>
                  <li>Create your personal watchlist</li>
                  <li>Trending content updated daily</li>
                  <li>Ad-free streaming experience</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.headers.get('origin') || 'https://flickpick.lovable.app'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);">
                  🎬 Start Watching Now
                </a>
              </div>

              <div style="background: #fff8e1; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="color: #f57f17; margin: 0; font-weight: bold;">💡 Pro Tip</p>
                <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
                  Complete your profile setup to get personalized movie recommendations!
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9ff; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
                Need help? We're here for you!
              </p>
              <a href="${req.headers.get('origin') || 'https://flickpick.lovable.app'}/support" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 14px;">
                📞 Contact Support
              </a>
              <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">
                © 2025 FlickPick. Made with ❤️ by Gerald
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
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
