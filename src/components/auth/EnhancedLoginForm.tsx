
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthLoadingState } from './AuthLoadingState';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { LoginFormHeader } from './LoginFormHeader';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoginFormDivider } from './LoginFormDivider';
import { EmailPasswordForm } from './EmailPasswordForm';
import { LoginFormFooter } from './LoginFormFooter';
import { AuthBanner } from './AuthBanner';

interface EnhancedLoginFormProps {
  onToggleMode: () => void;
}

export const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { login } = useAuth();

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login failed:', error);
      setAuthError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear auth error when user makes changes
    if (authError) {
      setAuthError(null);
    }
  };

  if (isLoading) {
    return <AuthLoadingState message="Signing you in..." isSubmitting />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          <LoginFormHeader />

          {authError && (
            <AuthErrorDisplay 
              error={authError} 
              onDismiss={() => setAuthError(null)} 
            />
          )}

          <GoogleSignInButton
            onGoogleLogin={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />

          <LoginFormDivider />

          <EmailPasswordForm
            email={email}
            password={password}
            showPassword={showPassword}
            fieldErrors={fieldErrors}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onEmailChange={(value) => handleInputChange('email', value)}
            onPasswordChange={(value) => handleInputChange('password', value)}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
          />

          <LoginFormFooter onToggleMode={onToggleMode} />
        </div>
      </div>

      {/* Right side - Banner */}
      <AuthBanner />
    </div>
  );
};
