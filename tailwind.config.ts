import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vintageBlue: '#1E46C8',
        vintageYellow: '#FFD031',
        vintagePink: '#FF4FA3',
        cabinetBlack: '#0A0A12'
      }
    }
  },
  plugins: []
};

export default config;
