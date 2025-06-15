
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Coffee, Star, Zap, Crown, Gift } from 'lucide-react';
import { toast } from 'sonner';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (amount < 1) {
      toast.error('Minimum donation amount is $1');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate donation processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Thank you for your $${amount} donation! 🎉`);
      setCustomAmount('');
    } catch (error) {
      toast.error('Donation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
            </div>
          </Card>

          {/* Donation Button */}
          <div className="text-center mb-12">
            <Button
              onClick={handleDonate}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              size="lg"
              className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5 mr-3" />
                  Donate ${customAmount || selectedAmount}
                </>
              )}
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
