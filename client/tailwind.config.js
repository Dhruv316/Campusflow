/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        arcade:  ['Bangers', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Backgrounds
        ink:     '#0D0D0D',
        surface: '#1A0A2E',
        card:    '#1E0A3C',
        raised:  '#2D1050',
        // Borders
        border:  '#4A1080',
        glow:    '#AAFF00',
        // Accents
        lime:    '#AAFF00',
        yellow:  '#F5E642',
        pink:    '#FF3CAC',
        cyan:    '#00E5FF',
        // Text
        primary:   '#FFFFFF',
        secondary: '#C9B8E8',
        muted:     '#8B6BA8',
      },
      boxShadow: {
        'lime':     '0 0 20px #AAFF0066',
        'lime-sm':  '0 0 10px #AAFF0044',
        'lime-xl':  '0 0 40px #AAFF0088',
        'lime-card':'0 0 24px #AAFF0022',
        'pink':     '0 0 20px #FF3CAC66',
        'cyan':     '0 0 20px #00E5FF66',
        'card':     '0 8px 32px #00000088',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 10px #AAFF0044' },
          '50%':     { boxShadow: '0 0 30px #AAFF0088' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
