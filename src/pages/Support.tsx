
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Coffee, Star, Users, Zap, Shield, CheckCircle, XCircle, DollarSign, TrendingUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KeshoPayButton } from 'keshopay-v1';

const Support = () => {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Exchange rate: 1 USD = 130 KES (approximate)
  const EXCHANGE_RATE = 130;

  const donationAmounts = {
    USD: [5, 10, 25, 50, 100],
    KSH: [650, 1300, 3250, 6500, 13000]
  };

  // KeshoPay Configuration
  const KESHO_APP_ID = "80165";

  // Get amounts for selected currency
  const currentAmounts = donationAmounts[selectedCurrency];

  // Convert amount based on currency
  const getConvertedAmount = (amount: number) => {
    if (selectedCurrency === 'USD') {
      return Math.round(amount * EXCHANGE_RATE);
    }
    return amount; // Already in KES
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount}`;
    }
    return `KSh ${amount.toLocaleString()}`;
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
    setSelectedAmount(currentAmounts[0]);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setSelectedAmount(donationAmounts[currency][0]);
  };

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  // Fullscreen Payment Modal Component
  const PaymentModal = () => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Support FlickPick</h2>
              <p className="text-sm text-muted-foreground">Choose your donation amount</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closePaymentModal}
            className="hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            {/* Payment Status Display */}
            {paymentStatus && (
              <div className={`p-6 rounded-xl text-center border-2 mb-6 ${
                paymentStatus === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
                  : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              }`}>
                <div className="flex items-center justify-center mb-3">
                  {paymentStatus === 'success' ? (
                    <CheckCircle className="h-8 w-8 mr-3" />
                  ) : (
                    <XCircle className="h-8 w-8 mr-3" />
                  )}
                  <span className="text-xl font-semibold">
                    {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                  </span>
                </div>
                {paymentStatus === 'success' && (
                  <Button
                    variant="outline"
                    onClick={resetPaymentStatus}
                    className="mt-3 bg-white/50 hover:bg-white/70"
                  >
                    Make Another Donation
                  </Button>
                )}
              </div>
            )}

            {!paymentStatus && (
              <>
                {/* Currency Selection */}
                <Card className="mb-6 bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg">Select Currency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger className="w-64 bg-background/80 border-border/50">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                          <SelectItem value="KSH">🇰🇪 KSH - Kenyan Shilling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Donation Amounts */}
                <Card className="mb-6 bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg">Choose Amount ({selectedCurrency})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      {currentAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? "default" : "outline"}
                          onClick={() => setSelectedAmount(amount)}
                          className="h-16 text-lg font-semibold bg-background/50 border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          {formatCurrency(amount, selectedCurrency)}
                        </Button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-4">Or enter a custom amount</p>
                      <div className="flex justify-center">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                            {selectedCurrency === 'USD' ? '$' : 'KSh'}
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={selectedAmount}
                            onChange={(e) => setSelectedAmount(parseInt(e.target.value) || 0)}
                            className="pl-12 pr-4 py-3 w-64 bg-background/80 border border-border/50 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            placeholder="Amount"
                          />
                        </div>
                      </div>

                      {/* Exchange Rate Display */}
                      {selectedCurrency === 'USD' && (
                        <p className="text-sm text-muted-foreground mt-4">
                          ≈ KSh {getConvertedAmount(selectedAmount).toLocaleString()} (at current exchange rates)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Button */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-6">
                        <KeshoPayButton
                          amount={getConvertedAmount(selectedAmount)}
                          reference={`FLICKPICK-${Date.now()}`}
                          appId={KESHO_APP_ID}
                          buttonText={`❤️ Donate ${formatCurrency(selectedAmount, selectedCurrency)}`}
                          identifier={`flickpick-user-${Date.now()}`}
                        />
                      </div>

                      {/* KeshoPay Info */}
                      <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-semibold">Secured by KeshoPay</span>
                        </div>
                        <p className="mb-2">
                          Safe and secure payment processing with M-Pesa, Airtel Money, and international card payments.
                        </p>
                        <p className="text-xs opacity-75">
                          All payments are processed in Kenyan Shillings (KES) at current exchange rates.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-6 rounded-full shadow-lg">
                <Heart className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-6">
              Support FlickPick
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Help us keep FlickPick free and ad-free for everyone. Your support enables us to 
              maintain the best streaming experience and develop exciting new features.
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground">Always</div>
              </div>
            </div>
          </div>

          {/* Why Support Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl hover:bg-card/80">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Server Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Keep our servers running at lightning speed for seamless 4K streaming without buffering
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl hover:bg-card/80">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">New Features</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Fund development of AI recommendations, offline downloads, and exclusive content
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl hover:bg-card/80">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Ad-Free Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Keep FlickPick completely free from advertisements and tracking forever
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Donation CTA */}
          <Card className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
                <Coffee className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">Buy Us a Coffee</CardTitle>
              <CardDescription className="text-lg">
                Support our work with a donation and help keep FlickPick free for everyone
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={openPaymentModal}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                <Heart className="h-5 w-5 mr-2" />
                Make a Donation
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Choose between USD and KSH • Secure payments via KeshoPay
              </p>
            </CardContent>
          </Card>

          {/* Community Section */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/20 rounded-full">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Join Our Growing Community
              </h3>
              <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
                Connect with other FlickPick users, get early access to features, and stay updated on our journey
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button variant="outline" size="lg" className="bg-background/50 hover:bg-background/70">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Discord
                </Button>
                <Button variant="outline" size="lg" className="bg-background/50 hover:bg-background/70">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </Button>
                <Button variant="outline" size="lg" className="bg-background/50 hover:bg-background/70">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Fullscreen Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default Support;
