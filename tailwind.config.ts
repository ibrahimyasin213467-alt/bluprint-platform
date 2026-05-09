import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'headline': ['var(--font-space)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
        'mono-accent': ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config