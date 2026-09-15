import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vintageBlue: '#1E46C8',
        vintageYellow: '#FFD031',
        vintagePink: '#FF4FA3',
        cabinetBlack: '#0A0A12',
        cabinetRed: '#D0202B'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 0 24px rgba(30,70,200,0.25), 0 0 80px rgba(255,79,163,0.12)',
        screen: 'inset 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 60px rgba(35,68,170,0.22), 0 8px 30px rgba(0,0,0,0.45)',
        neon: '0 0 18px rgba(255,208,49,0.4), 0 0 36px rgba(255,79,163,0.25)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        scanlines: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 2px, transparent 3px, transparent 6px)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.8' },
          '50%': { opacity: '1' }
        },
        marquee: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite',
        marquee: 'marquee 8s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
