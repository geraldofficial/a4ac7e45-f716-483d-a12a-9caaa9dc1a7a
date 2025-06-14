
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrendingEmailRequest {
  email: string;
  name?: string;
  trendingMovies?: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, trendingMovies }: TrendingEmailRequest = await req.json();
    const userName = name || email.split('@')[0];

    // Fetch trending movies if not provided
    let movies = trendingMovies;
    if (!movies) {
      const tmdbResponse = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${Deno.env.get('TMDB_API_KEY')}`);
      const tmdbData = await tmdbResponse.json();
      movies = tmdbData.results?.slice(0, 6) || [];
    }

    const movieCards = movies.map(movie => `
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 10px;">
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title || movie.name}" style="width: 100%; height: 200px; object-fit: cover;">
        <div style="padding: 15px;">
          <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${movie.title || movie.name}</h4>
          <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.4;">${(movie.overview || '').substring(0, 100)}...</p>
          <div style="margin-top: 10px;">
            <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 20px; font-size: 11px;">⭐ ${(movie.vote_average || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "FlickPick <trending@flickpick.com>",
      to: [email],
      subject: "🔥 This Week's Trending Movies & Shows on FlickPick",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trending on FlickPick</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🔥 Trending This Week</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">The hottest content everyone's watching</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Hey ${userName}! 👋</h2>
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                Don't miss out on what's trending! Here are the most popular movies and shows this week.
              </p>

              <!-- Movies Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 25px 0;">
                ${movieCards}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.headers.get('origin') || 'https://flickpick.com'}/trending" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);">
                  🍿 Watch Now
                </a>
              </div>

              <div style="background: #f8f9ff; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="color: #667eea; margin: 0; font-weight: bold;">💡 Personalized for You</p>
                <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
                  Complete your profile to get recommendations based on your preferences!
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8f9ff; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
                Need help or have questions?
              </p>
              <a href="${req.headers.get('origin') || 'https://flickpick.com'}/support" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 14px;">
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

    console.log("Trending email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending trending email:", error);
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
