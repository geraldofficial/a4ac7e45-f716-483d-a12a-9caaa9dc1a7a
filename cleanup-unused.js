#!/usr/bin/env node

// Simple cleanup script for unused components
const fs = require("fs");
const path = require("path");

const unusedComponents = [
  "src/components/AdBlockingVideoPlayer.tsx",
  "src/components/EnhancedVideoPlayerV2.tsx",
  "src/components/FullFeaturedVideoPlayer.tsx",
  "src/components/FullyFunctionalWatchParty.tsx",
  "src/components/DatabaseEnhancedWatchParty.tsx",
];

console.log("🧹 Cleaning up unused components...");

unusedComponents.forEach((componentPath) => {
  try {
    if (fs.existsSync(componentPath)) {
      fs.unlinkSync(componentPath);
      console.log(`✅ Removed: ${componentPath}`);
    } else {
      console.log(`⏭️  Already removed: ${componentPath}`);
    }
  } catch (error) {
    console.log(`❌ Failed to remove ${componentPath}:`, error.message);
  }
});

console.log("✨ Cleanup complete!");
