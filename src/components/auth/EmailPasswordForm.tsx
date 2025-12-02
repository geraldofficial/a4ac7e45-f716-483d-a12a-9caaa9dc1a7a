
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface EmailPasswordFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  fieldErrors: { [key: string]: string };
  isLoading: boolean;
  isGoogleLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({
  email,
  password,
  showPassword,
  fieldErrors,
  isLoading,
  isGoogleLoading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
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
          {fieldErrors.password && (
            <p className="text-destructive text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || isGoogleLoading}
        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};
