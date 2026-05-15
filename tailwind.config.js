/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mirrors mobile/lib/theme/app_theme.dart so the web feels like the same
      // product. Keys are kebab-case so generated class names (e.g.
      // bg-nova-surface-elevated) play nicely with Tailwind's @apply parser
      // in every supported version.
      colors: {
        nova: {
          bg: '#0A0E21',
          surface: '#141829',
          'surface-elevated': '#1C2235',
          divider: '#1E2540',
          'card-border': '#252B44',
          'text-primary': '#FFFFFF',
          'text-secondary': '#8B92B2',
          'text-hint': '#4A5175',
          accent: '#00D4AA',
          warning: '#FFB300',
          success: '#4CAF50',
          error: '#EF5350',
          primary: '#4F6AF5',
          'primary-light': '#7B8FF7',
          'gradient-end': '#7B5EA7',
        },
        // Legacy primary scale kept so existing bg-primary-{100..900} classes
        // already used across the codebase render against the new palette
        // without a wholesale rewrite. 500 = AppColors.primary, 900 = page bg.
        primary: {
          50:  '#EEF1FF',
          100: '#DBE1FF',
          200: '#B8C3FF',
          300: '#94A5FE',
          400: '#7B8FF7',
          500: '#4F6AF5',
          600: '#3F54CC',
          700: '#1C2235',
          800: '#141829',
          900: '#0A0E21',
        },
      },
      backgroundImage: {
        'nova-primary': 'linear-gradient(135deg, #4F6AF5 0%, #7B5EA7 100%)',
        'nova-bg': 'linear-gradient(180deg, #0D1229 0%, #0A0E21 100%)',
      },
      borderRadius: {
        'nova-sm': '10px',
        'nova':    '14px',
        'nova-lg': '20px',
      },
      boxShadow: {
        'nova-card': '0 8px 24px -8px rgba(79, 106, 245, 0.25)',
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', '-apple-system',
               'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
