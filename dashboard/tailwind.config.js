/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RexAI Design Tokens
        'rex-bg-900': '#0A1018',
        'rex-bg-800': '#131A24',
        'rex-blue': '#1FB6FF',
        'rex-blue-soft': 'rgba(31,182,255,0.15)',
        'rex-gold': '#C49E52',
        'rex-error': '#F05454',
        'rex-white': '#F8FAFC',
        'rex-grey': '#9CA3AF',
        'rex-warning': '#F59E0B',
        'rex-success': '#10B981',
        
        // Legacy support
        primary: '#1FB6FF',
        accent: '#C49E52',
        glass: 'rgba(31,182,255,0.1)',
        surface: '#131A24',
        darkbg: '#0A1018',
      },
      fontFamily: {
        display: ['Inter', 'SF Pro Display', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'rex': '14px',
      },
      boxShadow: {
        'rex-card': '0 8px 20px rgba(0,0,0,0.45)',
        'rex-glow': '0 0 20px rgba(31,182,255,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
        'spin': 'spin 0.8s linear infinite',
        'scale-hover': 'scaleHover 0.15s ease-out',
        'glow-pulse': 'glowPulse 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        skeletonPulse: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        },
        scaleHover: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.05)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 }
        }
      },
      transitionTimingFunction: {
        'rex-fast': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'rex-normal': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'rex-slow': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'rex-fast': '150ms',
        'rex-normal': '300ms',
        'rex-slow': '500ms',
      }
    },
  },
  plugins: [],
}
