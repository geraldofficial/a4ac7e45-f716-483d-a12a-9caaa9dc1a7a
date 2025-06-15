
import React from 'react';

interface LoginFormFooterProps {
  onToggleMode: () => void;
}

export const LoginFormFooter: React.FC<LoginFormFooterProps> = ({ onToggleMode }) => {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Don't have an account?{' '}
      <button
        onClick={onToggleMode}
        className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
      >
        Sign up
      </button>
    </p>
  );
};
