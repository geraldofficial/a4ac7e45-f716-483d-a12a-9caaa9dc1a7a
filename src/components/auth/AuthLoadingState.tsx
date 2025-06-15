
import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AuthLoadingStateProps {
  message?: string;
  isSubmitting?: boolean;
}

export const AuthLoadingState: React.FC<AuthLoadingStateProps> = ({
  message = "Authenticating...",
  isSubmitting = false
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg text-center space-y-4 min-w-[200px]">
        <LoadingSpinner size="lg" />
        <p className="text-foreground font-medium">{message}</p>
        {isSubmitting && (
          <p className="text-muted-foreground text-sm">Please wait...</p>
        )}
      </div>
    </div>
  );
};
