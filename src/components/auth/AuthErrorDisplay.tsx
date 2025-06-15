
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({
  error,
  onDismiss
}) => {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-destructive text-sm font-medium">Authentication Error</p>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
        </div>
        <Button
          onClick={onDismiss}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
