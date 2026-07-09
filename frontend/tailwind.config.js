/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Accent scale — Vercel blue, centered on #0070f3. Used sparingly:
        // links, focus rings, selected/active affordances, progress. It is NOT
        // the primary action color anymore (the primary button is the inverted
        // ink surface — see the `primary` tokens below).
        brand: {
          50: '#e6f0fe',
          100: '#cfe4ff',
          200: '#a3ccff',
          300: '#6bb0ff',
          400: '#3391ff',
          500: '#0070f3', // Vercel blue
          600: '#005cc4',
          700: '#004a9e',
          800: '#003d82',
          900: '#00326b',
        },
        // Semantic surface / text tokens driven by CSS variables so the same
        // class names work in both light and dark mode (see index.css).
        app: 'rgb(var(--color-app-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--color-ink-subtle) / <alpha-value>)',
        // Sparse accent (links, focus rings, active affordances). Themed so it
        // reads a touch brighter on the near-black dark background.
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        // The signature Vercel CTA: an inverted-ink surface. In dark it is a
        // soft-white fill with near-black text; in light it flips to a
        // near-black fill with near-white text.
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-fg': 'rgb(var(--color-primary-fg) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          'Geist Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Geist Mono Variable',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      borderRadius: {
        // Vercel radii: ~6px on controls (buttons/inputs/badges), ~12px on
        // cards/panels/modals. These override Tailwind's defaults for clarity.
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        // Vercel separates surfaces with hairline borders, not drop shadows.
        // `card` is intentionally flat; `overlay` is the only elevation, used
        // for floating panels (modals) above the scrim.
        card: 'none',
        overlay: '0 10px 40px -12px rgb(0 0 0 / 0.55)',
      },
    },
  },
  plugins: [],
};
