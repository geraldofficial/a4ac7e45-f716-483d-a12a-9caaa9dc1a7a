
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface SignupEmailPasswordFormProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  fieldErrors: { [key: string]: string };
  isLoading: boolean;
  isGoogleLoading: boolean;
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SignupEmailPasswordForm: React.FC<SignupEmailPasswordFormProps> = ({
  username,
  email,
  password,
  confirmPassword,
  showPassword,
  fieldErrors,
  isLoading,
  isGoogleLoading,
  onInputChange,
  onTogglePassword,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            onChange={(e) => onInputChange('username', e.target.value)}
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
            onChange={(e) => onInputChange('email', e.target.value)}
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
              onChange={(e) => onInputChange('password', e.target.value)}
              className={`h-12 pr-10 transition-colors ${
                fieldErrors.password ? 'border-destructive focus:border-destructive' : ''
              }`}
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <PasswordStrengthIndicator password={password} />
          
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
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
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
  );
};
