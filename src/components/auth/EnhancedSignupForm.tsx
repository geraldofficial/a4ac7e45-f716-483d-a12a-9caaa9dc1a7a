
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Check } from 'lucide-react';
import { FlickPickLogo } from '@/components/FlickPickLogo';
import { supabase } from '@/integrations/supabase/client';
import { AuthLoadingState } from './AuthLoadingState';
import { AuthErrorDisplay } from './AuthErrorDisplay';

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

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

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

  const passwordStrength = getPasswordStrength(password);

  if (isLoading) {
    return <AuthLoadingState message="Creating your account..." isSubmitting />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <FlickPickLogo size="lg" className="justify-center mb-8" />
            <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join FlickPick and start discovering amazing content
            </p>
          </div>

          {/* Error Display */}
          {authError && (
            <AuthErrorDisplay 
              error={authError} 
              onDismiss={() => setAuthError(null)} 
            />
          )}

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isGoogleLoading ? "Creating account..." : "Continue with Google"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`h-12 transition-colors ${
                    fieldErrors.username ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 transition-colors ${
                    fieldErrors.email ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-12 pr-10 transition-colors ${
                      fieldErrors.password ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength.score >= level 
                              ? passwordStrength.score === 4 ? 'bg-green-500' : 
                                passwordStrength.score === 3 ? 'bg-yellow-500' : 'bg-red-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {Object.entries(passwordStrength.checks).map(([check, passed]) => (
                        <div key={check} className="flex items-center gap-2 text-xs">
                          <Check className={`h-3 w-3 ${passed ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>
                            {check === 'length' && 'At least 8 characters'}
                            {check === 'uppercase' && 'One uppercase letter'}
                            {check === 'lowercase' && 'One lowercase letter'}
                            {check === 'number' && 'One number'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {fieldErrors.password && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`h-12 transition-colors ${
                    fieldErrors.confirmPassword ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Banner */}
      <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h1 className="text-4xl font-bold">
              Start Your Journey
              <br />
              Into Entertainment
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Get personalized movie recommendations, create watchlists, and never miss your favorite shows.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">Free</div>
                <div className="text-sm text-white/80">No Subscription</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">HD</div>
                <div className="text-sm text-white/80">High Quality</div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl" />
      </div>
    </div>
  );
};
