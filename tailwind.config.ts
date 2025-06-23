import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
      // Device-specific breakpoints
      mobile: "480px",
      tablet: "768px",
      desktop: "1024px",
      tv: "1920px",
      ultra: "2560px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
        // TV-friendly sizes
        "tv-sm": ["1.125rem", { lineHeight: "1.5rem" }],
        "tv-base": ["1.375rem", { lineHeight: "1.75rem" }],
        "tv-lg": ["1.625rem", { lineHeight: "2rem" }],
        "tv-xl": ["2rem", { lineHeight: "2.5rem" }],
        "tv-2xl": ["2.5rem", { lineHeight: "3rem" }],
      },
      gridTemplateColumns: {
        "auto-fit-200": "repeat(auto-fit, minmax(200px, 1fr))",
        "auto-fit-250": "repeat(auto-fit, minmax(250px, 1fr))",
        "auto-fit-300": "repeat(auto-fit, minmax(300px, 1fr))",
        "auto-fill-200": "repeat(auto-fill, minmax(200px, 1fr))",
        "auto-fill-250": "repeat(auto-fill, minmax(250px, 1fr))",
        "auto-fill-300": "repeat(auto-fill, minmax(300px, 1fr))",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out-bottom": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "slide-out-bottom": "slide-out-bottom 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/3": "2 / 3",
        "9/16": "9 / 16",
        "16/9": "16 / 9",
        "21/9": "21 / 9",
        poster: "2 / 3",
        landscape: "16 / 9",
        ultrawide: "21 / 9",
      },
      blur: {
        xs: "2px",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom utilities
    function ({ addUtilities, theme, addComponents }) {
      // Safe area utilities
      addUtilities({
        ".safe-top": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".safe-bottom": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".safe-left": {
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".safe-right": {
          paddingRight: "env(safe-area-inset-right)",
        },
        ".safe-x": {
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        },
        ".safe-y": {
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".safe-area": {
          paddingTop: "env(safe-area-inset-top)",
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
        },
      });

      // Touch-friendly utilities
      addUtilities({
        ".touch-manipulation": {
          touchAction: "manipulation",
        },
        ".touch-pan-x": {
          touchAction: "pan-x",
        },
        ".touch-pan-y": {
          touchAction: "pan-y",
        },
        ".touch-none": {
          touchAction: "none",
        },
      });

      // Focus utilities for better accessibility
      addUtilities({
        ".focus-ring": {
          "&:focus-visible": {
            outline: "2px solid hsl(var(--ring))",
            outlineOffset: "2px",
          },
        },
        ".focus-ring-inset": {
          "&:focus-visible": {
            outline: "2px solid hsl(var(--ring))",
            outlineOffset: "-2px",
          },
        },
      });

      // Responsive text utilities
      addComponents({
        ".text-responsive": {
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          "@screen sm": {
            fontSize: "1rem",
            lineHeight: "1.5rem",
          },
          "@screen lg": {
            fontSize: "1.125rem",
            lineHeight: "1.75rem",
          },
          "@screen tv": {
            fontSize: "1.375rem",
            lineHeight: "2rem",
          },
        },
        ".heading-responsive": {
          fontSize: "1.5rem",
          lineHeight: "2rem",
          fontWeight: "600",
          "@screen sm": {
            fontSize: "1.875rem",
            lineHeight: "2.25rem",
          },
          "@screen lg": {
            fontSize: "2.25rem",
            lineHeight: "2.5rem",
          },
          "@screen tv": {
            fontSize: "3rem",
            lineHeight: "1",
          },
        },
      });

      // Grid utilities for responsive layouts
      addComponents({
        ".grid-responsive": {
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(2, 1fr)",
          "@screen sm": {
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          },
          "@screen md": {
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          },
          "@screen lg": {
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.75rem",
          },
          "@screen xl": {
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "2rem",
          },
          "@screen 2xl": {
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: "2.5rem",
          },
        },
      });
    },
  ],
} satisfies Config;
