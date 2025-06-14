
// Kesho Pay integration service
export interface KeshoPayPaymentRequest {
  amount: number;
  reference: string;
  redirectUrl: string;
  currency: string;
  phoneNumber: string;
}

export interface KeshoPayResponse {
  success: boolean;
  data?: {
    checkoutUrl: string;
    transactionId: string;
  };
  message?: string;
}

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

export const keshoPayApi = {
  async initiatePayment(paymentData: KeshoPayPaymentRequest): Promise<KeshoPayResponse> {
    try {
      const response = await fetch('/api/v1/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Kesho Pay payment error:', error);
      return {
        success: false,
        message: 'Payment initiation failed'
      };
    }
  },

  createPaymentData(amount: number, reference: string, phoneNumber: string): KeshoPayPaymentRequest {
    return {
      amount,
      reference,
      redirectUrl: `${window.location.origin}/payment/success`,
      currency: 'KES',
      phoneNumber
    };
  }
};
