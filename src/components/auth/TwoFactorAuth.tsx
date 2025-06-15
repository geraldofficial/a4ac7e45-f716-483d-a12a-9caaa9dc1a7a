
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key, QrCode } from 'lucide-react';

interface TwoFactorAuthProps {
  onSetupComplete: (secret: string) => void;
  onVerify: (code: string) => Promise<boolean>;
  isEnabled: boolean;
  onDisable: () => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onSetupComplete,
  onVerify,
  isEnabled,
  onDisable
}) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQR42mNkYPhfz/wAChAI/kxDlzQAAAABJRU5ErkJggg=='); // Mock QR code
  const [secret] = useState('JBSWY3DPEHPK3PXP'); // Mock secret
  const { toast } = useToast();

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await onVerify(verificationCode);
      if (isValid) {
        onSetupComplete(secret);
        setStep('complete');
        toast({
          title: "2FA enabled",
          description: "Two-factor authentication has been successfully enabled.",
        });
      } else {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify the code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = () => {
    onDisable();
    toast({
      title: "2FA disabled",
      description: "Two-factor authentication has been disabled.",
    });
  };

  if (isEnabled) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">2FA is currently enabled</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              Your account is protected with two-factor authentication.
            </p>
          </div>
          
          <Button onClick={handleDisable2FA} variant="outline">
            Disable 2FA
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold">Enable Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Step 1: Install an authenticator app</p>
                <p className="text-sm text-muted-foreground">
                  Download Google Authenticator, Authy, or similar app
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <QrCode className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Step 2: Scan the QR code</p>
                <p className="text-sm text-muted-foreground">
                  Use your authenticator app to scan this QR code
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4 border rounded-lg" />
            <p className="text-sm text-muted-foreground mb-2">Or enter this key manually:</p>
            <code className="text-sm bg-muted px-2 py-1 rounded">{secret}</code>
          </div>

          <Button onClick={() => setStep('verify')} className="w-full">
            Continue to Verification
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Key className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Step 3: Enter verification code</p>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('setup')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">
              2FA Successfully Enabled!
            </h4>
            <p className="text-sm text-muted-foreground">
              Your account is now protected with two-factor authentication.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
