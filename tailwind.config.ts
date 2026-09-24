import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 60px rgba(15, 23, 42, 0.12)'
      },
      colors: {
        brand: {
          50: '#eefdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        }
      }
    }
  },
  plugins: []
};

export default config;
