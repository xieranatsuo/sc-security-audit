/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:       '#09090b',
        surface: {
          1: '#111113',
          2: '#18181b',
          3: '#222225',
        },
        accent: {
          DEFAULT: '#818cf8',
          hover:   '#a5b4fc',
          muted:   'rgba(129,140,248,0.12)',
          ring:    'rgba(129,140,248,0.25)',
        },
        txt: {
          primary:   '#fafafa',
          secondary: '#a1a1aa',
          tertiary:  '#71717a',
          disabled:  '#3f3f46',
        },
        success: {
          DEFAULT: '#34d399',
          muted:   'rgba(52,211,153,0.12)',
        },
        warning: {
          DEFAULT: '#fbbf24',
          muted:   'rgba(251,191,36,0.12)',
        },
        danger: {
          DEFAULT: '#f87171',
          muted:   'rgba(248,113,113,0.12)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover:   'rgba(255,255,255,0.10)',
          active:  'rgba(129,140,248,0.30)',
        },
      },
      fontFamily: {
        sans: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'xs':  ['11px', { lineHeight: '1.5' }],
        'sm':  ['12px', { lineHeight: '1.5' }],
        'base':['14px', { lineHeight: '1.6' }],
        'lg':  ['16px', { lineHeight: '1.5' }],
        'xl':  ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
        '26':  '104px',
        '30':  '120px',
        '34':  '136px',
        'sidebar':      '260px',
        'sidebar-collapsed': '64px',
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
      },
      boxShadow: {
        'sm':   '0 1px 2px rgba(0,0,0,0.3)',
        'md':   '0 2px 8px rgba(0,0,0,0.4)',
        'lg':   '0 8px 24px rgba(0,0,0,0.5)',
        'glow': '0 0 20px rgba(129,140,248,0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        spin: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease forwards',
        'slide-up':  'slideUp 0.3s ease forwards',
        'slide-down':'slideDown 0.3s ease forwards',
        'shimmer':   'shimmer 1.5s ease-in-out infinite',
        'pulse':     'pulse 2s ease-in-out infinite',
        'spin':      'spin 1s linear infinite',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
};
