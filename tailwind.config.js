/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b',
          850: '#172033', 900: '#0f172a', 950: '#080f1a'
        },
        accent: {
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca'
        },
        success: { 400: '#4ade80', 500: '#22c55e' },
        warning: { 400: '#fb923c', 500: '#f97316' },
        danger:  { 400: '#f87171', 500: '#ef4444' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'fade-in':       'fadeIn 0.15s ease-out',
        'slide-in-right':'slideInRight 0.2s ease-out',
        'slide-in-up':   'slideInUp 0.2s ease-out'
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        slideInUp:    { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
      }
    }
  },
  plugins: []
}
