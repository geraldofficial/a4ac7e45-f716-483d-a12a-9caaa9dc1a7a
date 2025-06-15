
import React, { memo } from 'react';
import { HeroCarousel } from './HeroCarousel';

export const HeroSection = memo(() => {
  return <HeroCarousel />;
});

HeroSection.displayName = 'HeroSection';
