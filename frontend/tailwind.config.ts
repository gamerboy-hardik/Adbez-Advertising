import type { Config } from 'tailwindcss';

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
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        background:         'var(--bg-primary)',
        card:               'var(--bg-card)',
        'card-hover':       'var(--bg-card-hover)',
        border:             'var(--border)',
        foreground:         'var(--text-primary)',
        secondary:          'var(--bg-secondary)',
        muted:              'var(--bg-glass)',
        'muted-foreground': 'var(--text-muted)',
        primary:            'var(--accent)',
        'primary-foreground': '#ffffff',
        accent:             'var(--accent)',
        'accent-foreground': '#ffffff',
        destructive:        'var(--danger)',
        success:            'var(--success)',
      },
      boxShadow: {
        'glow':    'var(--shadow-glow)',
        'glow-sm': '0 0 12px rgba(99,102,241,0.15)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
