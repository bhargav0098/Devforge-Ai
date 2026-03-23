import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          cyan: '#00d9ff',
          purple: '#a855f7',
          pink: '#ff2e97',
          dark: '#0a0f1e',
          darker: '#1a1f2e'
        }
      },
    },
  },
  plugins: [],
}
export default config
