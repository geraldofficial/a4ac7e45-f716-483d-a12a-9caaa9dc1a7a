
import React, { useState } from 'react';
import { EnhancedLoginForm } from '@/components/auth/EnhancedLoginForm';
import { EnhancedSignupForm } from '@/components/auth/EnhancedSignupForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <EnhancedLoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <EnhancedSignupForm onToggleMode={() => setIsLogin(true)} />
  );
};

export default Auth;
