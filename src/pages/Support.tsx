import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Coffee, Star, Users, Zap, Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const donationAmounts = [5, 10, 25, 50, 100];

  // KeshoPay Configuration - In a real app, these would be environment variables
  const KESHO_PUBLIC_KEY = process.env.REACT_APP_KESHO_PUBLIC_KEY || 'pk_test_your_public_key';
  const KESHO_PRIVATE_KEY = process.env.REACT_APP_KESHO_PRIVATE_KEY || 'sk_test_your_private_key';
  const KESHO_WALLET_APP_ID = '80165'; // Your app ID
  const KESHO_API_BASE_URL = 'https://api.keshopay.co.ke/api/v1';

  // Create Authorization Key as per KeshoPay documentation
  const createAuthorizationKey = (publicKey, privateKey, amount, walletId) => {
    const data = {
      publicKey,
      privateKey,
      amount,
      walletId,
      timestamp: Date.now()
    };
    const jsonString = JSON.stringify(data);
    return btoa(jsonString); // Base64 encode
  };

  const initializeKeshoPayment = async (amount) => {
    setIsProcessing(true);
    setPaymentStatus(null);

    try {
      // Convert USD to KES (approximate rate - in production, use real-time rates)
      const amountInKES = Math.round(amount * 130); // 1 USD ≈ 130 KES
      
      // Create authorization key
      const authorizationKey = createAuthorizationKey(
        KESHO_PUBLIC_KEY,
        KESHO_PRIVATE_KEY,
        amountInKES,
        KESHO_WALLET_APP_ID
      );

      // Generate unique reference
      const reference = `FLICKPICK-${Date.now()}`;

      // Make payment request to KeshoPay
      const response = await fetch(`${KESHO_API_BASE_URL}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorizationKey,
          amount: amountInKES,
          reference: reference,
          redirectUrl: `${window.location.origin}/support?payment=success`,
          currency: 'KES',
          phoneNumber: '', // Will be collected by KeshoPay checkout
          description: `FlickPick Support Donation - ${amount} USD`
        })
      });

      const result = await response.json();

      if (result.success && result.data?.checkoutUrl) {
        // Redirect to KeshoPay checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        throw new Error(result.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setPaymentStatus('error');
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDonate = async (amount) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    // Initialize KeshoPay payment
    await initializeKeshoPayment(amount);
  };

  // Check for payment success on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setPaymentStatus('success');
      toast({
        title: "Payment Successful! ❤️",
        description: "Thank you for your generous donation to FlickPick!",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const resetPaymentStatus = () => {
    setPaymentStatus(null);
    setSelectedAmount(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Support FlickPick
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us keep FlickPick free and ad-free for everyone. Your support enables us to 
              maintain the best streaming experience and develop new features.
            </p>
          </div>

          {/* Why Support Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardHeader className="text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Server Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Keep our servers running fast and reliable for smooth streaming
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardHeader className="text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">New Features</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Fund development of new features and improvements
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Ad-Free</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Keep FlickPick completely free from advertisements
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Donation Section */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader className="text-center">
              <Coffee className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-xl">Buy Us a Coffee</CardTitle>
              <CardDescription>
                Choose an amount to support our work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Status Display */}
              {paymentStatus && (
                <div className={`p-4 rounded-lg text-center ${
                  paymentStatus === 'success' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    {paymentStatus === 'success' ? (
                      <CheckCircle className="h-6 w-6 mr-2" />
                    ) : (
                      <XCircle className="h-6 w-6 mr-2" />
                    )}
                    <span className="font-semibold">
                      {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                    </span>
                  </div>
                  {paymentStatus === 'success' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPaymentStatus}
                      className="mt-2"
                    >
                      Make Another Donation
                    </Button>
                  )}
                </div>
              )}

              {!paymentStatus && (
                <>
                  {/* Donation Amounts */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {donationAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => setSelectedAmount(amount)}
                        className="h-12 text-lg font-semibold"
                        disabled={isProcessing}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Or enter a custom amount</p>
                    <div className="flex justify-center gap-2 mb-6">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={selectedAmount}
                          onChange={(e) => setSelectedAmount(parseInt(e.target.value) || 0)}
                          className="pl-8 pr-4 py-2 w-32 bg-background border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Amount"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>

                    {/* Donate Button with KeshoPay */}
                    <Button
                      onClick={() => handleDonate(selectedAmount)}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
                      disabled={selectedAmount <= 0 || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5 mr-2" />
                          Donate ${selectedAmount}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* KeshoPay Info */}
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Secured by KeshoPay</span>
                    </div>
                    <p className="mb-1">
                      Safe and secure payment processing with M-Pesa, Airtel Money, and card payments.
                    </p>
                    <p className="text-xs">
                      Amount will be converted to KES at current exchange rates.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Community Section */}
          <div className="text-center mt-12">
            <div className="bg-primary/10 p-6 rounded-2xl">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Join Our Community
              </h3>
              <p className="text-muted-foreground mb-4">
                Connect with other FlickPick users and stay updated on new features
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  Discord
                </Button>
                <Button variant="outline" size="sm">
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Support;
