
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast.error("Phone number required", {
        description: "Please enter your phone number to proceed with payment."
      });
      return;
    }

    setLoading(true);
    try {
      const reference = `FLICKPICK-${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('kesho-payment', {
        body: {
          amount: amount * 100, // Convert to cents
          reference,
          phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.replace(/^0/, '')}`
        }
      });

      if (error) throw error;

      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error("Payment failed", {
        description: error.message || "Failed to initiate payment. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-lg">KES {amount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="07XXXXXXXX or 254XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your M-Pesa number to receive payment prompt
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Secured by <span className="font-semibold">Kesho Pay</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
