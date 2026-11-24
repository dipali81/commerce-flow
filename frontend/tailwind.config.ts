import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f2350'
        }
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(15, 35, 80, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
