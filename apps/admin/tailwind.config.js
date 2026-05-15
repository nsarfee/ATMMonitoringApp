/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bop: {
          50:  '#e6f2ec',
          100: '#c0ddcc',
          200: '#96c6a9',
          300: '#6aaf85',
          400: '#459d68',
          500: '#1f8c4c',
          600: '#006633',
          700: '#005529',
          800: '#00431f',
          900: '#003116',
        },
        gold: {
          400: '#e0b84e',
          500: '#c8942a',
          600: '#a87820',
        },
        // BOP orange brand (from bop.com.pk)
        bopo: {
          400: '#f58142',
          500: '#f26522', // BOP primary orange
          600: '#d45315',
          700: '#b04010',
        },
        // NOC dark-theme palette
        noc: {
          800: '#111827',
          850: '#0d1520',
          900: '#090d14',
          925: '#070b11',
          950: '#05080f',
        },
        // Operational signal colors
        signal: {
          green:  '#00e676',
          teal:   '#00bfa5',
          amber:  '#ffa500',
          orange: '#ff8c00',
          red:    '#ff4444',
          blue:   '#6a9aba',
          dim:    '#2a4060',
          dimmer: '#1a2a3a',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      animation: {
        'blink': 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [],
};
