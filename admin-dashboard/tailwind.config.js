/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0B0D12', elev: '#14161E', card: '#1A1D27', hover: '#1F2230' },
        ink: { DEFAULT: '#F0F1F5', 2: '#9CA3AF', 3: '#6B7280' },
        line: { DEFAULT: '#2A2E3A', strong: '#3A3F4D' },
        brand: { DEFAULT: '#5B3DF5', ink: '#2A1A8E', tint: '#1A1533', light: '#B4A2FF' },
        status: {
          auditing:   { DEFAULT: '#3B82F6', tint: '#1A2744' },
          finished:   { DEFAULT: '#10B981', tint: '#1A3A2E' },
          waiting:    { DEFAULT: '#F59E0B', tint: '#3A2E1A' },
          enrolled:   { DEFAULT: '#5B3DF5', tint: '#1A1533' },
        },
        accent: {
          red:   { DEFAULT: '#DC2626', tint: '#3A1A1A' },
          amber: { DEFAULT: '#D97706', tint: '#3A2E1A' },
          emerald: { DEFAULT: '#047857', tint: '#1A3A2E' },
        },
      },
      borderRadius: {
        'md2': '10px',
        'lg2': '14px',
        'xl2': '18px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,.03), 0 1px 2px rgba(0,0,0,.3)',
        glow: '0 0 20px rgba(91,61,245,.15)',
      },
    },
  },
  plugins: [],
}
