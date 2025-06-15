
import React from 'react';

interface SignupFormFooterProps {
  onToggleMode: () => void;
}

export const SignupFormFooter: React.FC<SignupFormFooterProps> = ({ onToggleMode }) => {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Already have an account?{' '}
      <button
        onClick={onToggleMode}
        className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
      >
        Sign in
      </button>
    </p>
  );
};
