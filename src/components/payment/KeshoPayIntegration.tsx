
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { keshoPayApi, KeshoPayPaymentRequest } from '@/services/kesho-pay';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2, Shield } from 'lucide-react';

interface KeshoPayIntegrationProps {
  amount: number;
  title: string;
  description?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export const KeshoPayIntegration: React.FC<KeshoPayIntegrationProps> = ({
  amount,
  title,
  description,
  onSuccess,
  onError,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to proceed with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reference = `FLICKPICK-${Date.now()}`;
      const paymentData: KeshoPayPaymentRequest = keshoPayApi.createPaymentData(
        amount,
        reference,
        phoneNumber
      );

      const response = await keshoPayApi.initiatePayment(paymentData);

      if (response.success && response.data) {
        // Redirect to checkout URL
        window.location.href = response.data.checkoutUrl;
        onSuccess?.(response.data.transactionId);
      } else {
        throw new Error(response.message || 'Payment initiation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        <div className="text-2xl font-bold text-primary mt-3">
          KSh {amount.toLocaleString()}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="254XXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter your M-Pesa or Airtel Money number
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by KeshoPay with M-Pesa, Airtel Money, and card payments
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
