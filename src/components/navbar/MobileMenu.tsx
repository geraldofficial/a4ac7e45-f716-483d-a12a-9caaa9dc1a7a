
import React from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isMenuOpen,
  setIsMenuOpen
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 hover:bg-background/60"
        style={{ touchAction: 'manipulation' }}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 py-4" style={{ touchAction: 'manipulation' }}>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => { navigate('/browse'); setIsMenuOpen(false); }}
              className="text-left text-foreground hover:text-primary transition-colors font-medium"
              style={{ touchAction: 'manipulation' }}
            >
              Browse
            </button>
            
            {!user && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  className="w-full"
                  style={{ touchAction: 'manipulation' }}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
