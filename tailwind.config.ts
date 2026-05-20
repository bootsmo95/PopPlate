import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm linen / cream / clay
        bg: '#f3ede2',
        warm: '#ebe2d1',
        paper: '#f8f3e9',
        deep: '#2b1f15',
        card: '#ede4d2',
        'card-alt': '#e1d6c1',

        // Ink scale
        ink: {
          DEFAULT: '#1a1410',
          soft: '#3d2e22',
          mute: '#6f5d4d',
          faint: '#9a8773',
          light: '#c3b6a3',
          inv: '#f3ede2',
        },

        // Accents
        clay: {
          DEFAULT: '#b87a4e',
          deep: '#8b4e2c',
          soft: '#d4a880',
        },
        olive: '#6b6850',
        plum: '#6e4a45',
        moss: '#5c6b4d',

        // Status
        status: {
          draft: '#9a8773',
          processing: '#c89968',
          ready: '#6e8b5a',
          published: '#6e7d8b',
          failed: '#a85a48',
        },
      },

      fontFamily: {
        display: ['Cormorant', 'EB Garamond', 'Georgia', 'serif'],
        body: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
      },

      letterSpacing: {
        'mono-wide': '0.18em',
        'mono-wider': '0.22em',
        display: '-0.025em',
      },

      borderColor: {
        line: 'rgba(26, 20, 16, 0.10)',
        'line-strong': 'rgba(26, 20, 16, 0.22)',
        'line-warm': 'rgba(184, 122, 78, 0.30)',
      },

      backgroundImage: {
        'acc-grad': 'linear-gradient(115deg, #b87a4e 0%, #c89968 50%, #8b4e2c 100%)',
        'deep-radial':
          'radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.35), transparent 55%)',
      },

      maxWidth: {
        platform: '1280px',
        wrap: '1320px',
      },

      spacing: {
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
        '15':  '3.75rem',   // 60px
        '18':  '4.5rem',    // 72px
        '22':  '5.5rem',    // 88px
        '25':  '6.25rem',   // 100px
        '30':  '7.5rem',    // 120px
        '35':  '8.75rem',   // 140px
      },

      keyframes: {
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-clay': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shine: {
          '0%, 100%': { transform: 'translateX(-30%)' },
          '50%': { transform: 'translateX(30%)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0) rotateX(58deg)' },
          '50%': { transform: 'translateY(-10px) rotateX(58deg)' },
        },
        'prog-shimmer': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'arrow-down': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(4px)', opacity: '1' },
        },
      },
      animation: {
        'rotate-slow': 'rotate-slow 14s linear infinite',
        'rotate-model': 'rotate-slow 16s linear infinite',
        'pulse-clay': 'pulse-clay 1.6s ease-out infinite',
        shine: 'shine 6s ease-in-out infinite',
        'shine-slow': 'shine 8s ease-in-out infinite',
        'float-y': 'float-y 4s ease-in-out infinite',
        'prog-shimmer': 'prog-shimmer 1.6s linear infinite',
        marquee: 'marquee 38s linear infinite',
        'arrow-down': 'arrow-down 2s ease-in-out infinite',
      },

      boxShadow: {
        card: '0 14px 30px rgba(26, 20, 16, 0.10)',
        plate: '0 30px 60px rgba(26, 20, 16, 0.25)',
        hero: '0 60px 120px rgba(26, 20, 16, 0.32), 0 20px 40px rgba(26, 20, 16, 0.18)',
        'inset-rim':
          '0 30px 50px rgba(0,0,0,0.5), inset 0 4px 12px rgba(255,255,255,0.1), inset 0 -20px 30px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
