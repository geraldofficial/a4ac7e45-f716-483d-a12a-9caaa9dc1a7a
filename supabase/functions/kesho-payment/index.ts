
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createAuthorizationKey(publicKey: string, privateKey: string, amount: number, walletId: string) {
  const data = {
    publicKey,
    privateKey,
    amount,
    walletId,
    timestamp: Date.now()
  };
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, reference, phoneNumber } = await req.json();
    
    const publicKey = Deno.env.get('KESHO_PAY_PUBLIC_KEY');
    const privateKey = Deno.env.get('KESHO_PAY_PRIVATE_KEY');
    const walletId = '80165'; // Your app ID
    
    if (!publicKey || !privateKey) {
      throw new Error('Kesho Pay credentials not configured');
    }

    const authorizationKey = createAuthorizationKey(publicKey, privateKey, amount, walletId);

    const paymentResponse = await fetch('https://api.keshopay.com/api/v1/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorizationKey,
        amount,
        reference,
        redirectUrl: `${req.headers.get('origin')}/payment/success`,
        currency: 'KES',
        phoneNumber
      })
    });

    const result = await paymentResponse.json();
    
    console.log('Kesho Pay response:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in kesho-payment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message || 'Payment processing failed'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
