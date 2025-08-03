import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      animation: {
        // Android-style animations
        'android-fade-in': 'androidFadeIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-fade-out': 'androidFadeOut 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-slide-up': 'androidSlideUp 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-slide-down': 'androidSlideDown 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-slide-left': 'androidSlideLeft 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-slide-right': 'androidSlideRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-scale-in': 'androidScaleIn 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-scale-out': 'androidScaleOut 0.15s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-ripple': 'androidRipple 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-bounce': 'androidBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'android-drawer-slide': 'androidDrawerSlide 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'bounce': 'bounce 0.6s ease-out',
        'android-fab-scale': 'androidFabScale 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      keyframes: {
        androidFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        androidFadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        androidSlideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        androidSlideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        androidSlideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        androidSlideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        androidScaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        androidScaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        androidRipple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        androidBounce: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        androidDrawerSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        androidFabScale: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'android-standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'android-decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'android-accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'android-sharp': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
