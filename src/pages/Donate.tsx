
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Coffee, Star, Zap, Crown, Gift, Shield, CreditCard, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { KeshoPayButton } from 'keshopay-v1';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Your KeshoPay App ID
  const KESHO_APP_ID = "80165";

  // Exchange rate: 1 USD = 130 KES (approximate)
  const EXCHANGE_RATE = 130;

  const donationTiers = [
    {
      amount: 3,
      icon: Coffee,
      title: 'Buy us a coffee',
      description: 'Help keep our servers running',
      color: 'from-amber-500 to-orange-500'
    },
    {
      amount: 5,
      icon: Heart,
      title: 'Show some love',
      description: 'Support our mission',
      color: 'from-pink-500 to-red-500'
    },
    {
      amount: 10,
      icon: Star,
      title: 'You\'re a star',
      description: 'Help us add new features',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      amount: 25,
      icon: Zap,
      title: 'Power user',
      description: 'Supercharge development',
      color: 'from-blue-500 to-purple-500'
    },
    {
      amount: 50,
      icon: Crown,
      title: 'VIP supporter',
      description: 'Become a patron',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const getDonationAmount = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    return Math.round(amount * EXCHANGE_RATE); // Convert to KES
  };

  const getDonationReference = () => {
    return `FLICKPICK-${Date.now()}`;
  };

  const getDonationIdentifier = () => {
    return `flickpick-user-${Date.now()}`;
  };

  const handleDonateClick = () => {
    if (!customAmount && !selectedAmount) {
      toast.error('Please select or enter a donation amount');
      return;
    }
    setShowPaymentForm(true);
  };

  // Check for payment success on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      toast.success('Thank you for your generous donation! 🎉');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-20 md:pt-24 pb-24 md:pb-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <Heart className="h-12 w-12 text-red-500 animate-pulse mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Complete Your Donation</h1>
              <p className="text-lg text-muted-foreground">
                You're donating <span className="font-bold text-primary">${customAmount || selectedAmount}</span> to support FlickPick
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Secure Payment with KeshoPay
                </h3>
                <p className="text-muted-foreground">
                  Amount: KSh {getDonationAmount().toLocaleString()}
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                <KeshoPayButton
                  amount={getDonationAmount()}
                  reference={getDonationReference()}
                  appId={KESHO_APP_ID}
                  buttonText={`💝 Donate $${customAmount || selectedAmount}`}
                  identifier={getDonationIdentifier()}
                />
              </div>
              
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 mb-4">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-foreground">Secure Payment</span>
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Powered by KeshoPay with M-Pesa, Airtel Money, and card payments
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowPaymentForm(false)}
                className="w-full"
              >
                Back to Amount Selection
              </Button>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-24 md:pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="h-12 w-12 text-red-500 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Support FlickPick</h1>
              <Gift className="h-12 w-12 text-purple-500 animate-bounce" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Help us keep FlickPick free and amazing for everyone. Your support helps us maintain servers, 
              add new features, and improve your movie discovery experience.
            </p>
          </div>

          {/* Donation Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {donationTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.amount}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                    selectedAmount === tier.amount && !customAmount
                      ? 'border-primary bg-primary/5 scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedAmount(tier.amount);
                    setCustomAmount('');
                  }}
                >
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">${tier.amount}</div>
                    <h3 className="font-semibold text-foreground mb-2">{tier.title}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Custom Amount */}
          <Card className="mb-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Or choose your own amount
              </h3>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold text-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  className="text-center text-xl font-semibold max-w-xs"
                  min="1"
                  step="0.01"
                />
              </div>
              {(customAmount || selectedAmount > 0) && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  ≈ KSh {getDonationAmount().toLocaleString()} (converted to Kenyan Shillings)
                </p>
              )}
            </div>
          </Card>

          {/* Donate Button */}
          <div className="text-center mb-12">
            <Button 
              onClick={handleDonateClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              disabled={!customAmount && !selectedAmount}
            >
              <Heart className="h-5 w-5 mr-2" />
              Donate ${customAmount || selectedAmount}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Why Donate */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/20">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Why your support matters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Keep it fast</h4>
                  <p className="text-muted-foreground">Your donations help us maintain fast, reliable servers</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Add features</h4>
                  <p className="text-muted-foreground">Fund development of new features and improvements</p>
                </div>
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Stay free</h4>
                  <p className="text-muted-foreground">Keep FlickPick free for everyone to enjoy</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Donate;
