
import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const toasts: Toast[] = [];

export const useToast = () => {
  const [, forceUpdate] = useState({});

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, description, variant };
    
    toasts.push(newToast);
    forceUpdate({});
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        forceUpdate({});
      }
    }, 5000);
  }, []);

  return { toast, toasts };
};

// Export toast function directly
export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { id, title, description, variant };
  
  toasts.push(newToast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
    }
  }, 5000);
};
