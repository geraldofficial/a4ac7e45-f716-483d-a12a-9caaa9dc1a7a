
import React from 'react';
import { FlickPickLogo } from '@/components/FlickPickLogo';

export const LoginFormHeader: React.FC = () => {
  return (
    <div className="text-center">
      <FlickPickLogo size="lg" className="justify-center mb-8" />
      <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to your FlickPick account
      </p>
    </div>
  );
};
