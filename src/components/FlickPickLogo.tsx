import React from "react";

interface FlickPickLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  responsive?: boolean; // New prop for responsive behavior
}

export const FlickPickLogo: React.FC<FlickPickLogoProps> = ({
  className = "",
  size = "md",
  showIcon = true,
  showText = true,
  responsive = false,
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const logoSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="relative">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick Logo"
            className={`${logoSizes[size]} object-contain rounded-lg`}
          />
        </div>
      )}
      {showText && (
        <span
          className={`${sizeClasses[size]} font-bold text-foreground ${
            responsive ? "hidden md:inline" : ""
          }`}
        >
          FlickPick
        </span>
      )}
    </div>
  );
};
