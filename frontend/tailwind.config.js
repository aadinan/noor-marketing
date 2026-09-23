/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE', 
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
          border: '#E2E8F0',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        status: {
          successBg: '#F0FDF4',
          successText: '#0D9488',
          warningBg: '#FFF7ED',
          warningText: '#EA580C',
          errorBg: '#FFF1F2',
          errorText: '#E11D48',
          infoBg: '#EFF6FF',
          infoText: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}