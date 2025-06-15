
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthLoadingState } from './AuthLoadingState';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { SignupFormHeader } from './SignupFormHeader';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoginFormDivider } from './LoginFormDivider';
import { SignupEmailPasswordForm } from './SignupEmailPasswordForm';
import { SignupFormFooter } from './SignupFormFooter';
import { SignupBanner } from './SignupBanner';

interface EnhancedSignupFormProps {
  onToggleMode: () => void;
}

export const EnhancedSignupForm: React.FC<EnhancedSignupFormProps> = ({ onToggleMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { signup } = useAuth();

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
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
      await signup(email, password, username);
    } catch (error: any) {
      console.error('Signup failed:', error);
      setAuthError(error.message || 'Account creation failed. Please try again.');
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
      setAuthError('Google sign-up failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') setUsername(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'confirmPassword') setConfirmPassword(value);
    
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
    return <AuthLoadingState message="Creating your account..." isSubmitting />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          <SignupFormHeader />

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

          <SignupEmailPasswordForm
            username={username}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            fieldErrors={fieldErrors}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
          />

          <SignupFormFooter onToggleMode={onToggleMode} />
        </div>
      </div>

      {/* Right side - Banner */}
      <SignupBanner />
    </div>
  );
};
