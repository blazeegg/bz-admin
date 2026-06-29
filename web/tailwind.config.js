/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent) / 0.14)',
        },
        ink: {
          950: '#070809',
          900: '#0b0d11',
          850: '#0f1217',
          800: '#13161d',
          750: '#181c25',
          700: '#1e2330',
          600: '#262c3b',
        },
        line: 'rgb(255 255 255 / 0.07)',
        role: {
          mod: '#22c55e',
          admin: '#4f8cff',
          super: '#a855f7',
          owner: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'Geist', 'system-ui', 'sans-serif'],
        display: ['"Sora Variable"', '"Geist Variable"', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.4), 0 8px 30px -6px rgb(var(--accent) / 0.35)',
        pop: '0 24px 60px -18px rgb(0 0 0 / 0.85)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgb(255 255 255 / 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.025) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '34px 34px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'scale-in': 'scale-in 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
