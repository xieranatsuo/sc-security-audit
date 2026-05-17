/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface': {
          0: '#0a0a0f',
          1: '#12121a',
          2: '#1a1a24',
          3: '#222230',
        },
        'accent': {
          blue: '#2563eb',
          green: '#16a34a',
          red: '#dc2626',
          orange: '#ea580c',
          yellow: '#ca8a04',
        },
        'gray': {
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
