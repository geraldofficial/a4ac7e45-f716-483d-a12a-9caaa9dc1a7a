
import React, { useState } from 'react';
import { NavbarLogo } from './navbar/NavbarLogo';
import { DesktopNavigation } from './navbar/DesktopNavigation';
import { DesktopSearch } from './navbar/DesktopSearch';
import { UserMenu } from './navbar/UserMenu';
import { MobileSearch } from './navbar/MobileSearch';
import { MobileMenu } from './navbar/MobileMenu';
import { PWAInstallButton } from './PWAInstallButton';

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-navbar bg-background/95 backdrop-blur-3xl border-b border-border/50" style={{ pointerEvents: 'auto' }}>
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <NavbarLogo />

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Search & User Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Search */}
            <DesktopSearch />

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Mobile Search Button */}
            <MobileSearch
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
            />

            {/* User Menu or Auth Buttons */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <MobileMenu
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
