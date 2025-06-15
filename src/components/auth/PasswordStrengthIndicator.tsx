
import React from 'react';
import { Check } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
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

  const passwordStrength = getPasswordStrength(password);

  if (!password) return null;

  return (
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
  );
};
