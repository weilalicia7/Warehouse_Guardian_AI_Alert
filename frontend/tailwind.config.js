/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - JD.com Red
        primary: {
          DEFAULT: '#E4393C',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A7',
          400: '#F87171',
          500: '#E4393C',
          600: '#C41D1D',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#5F1616',
        },

        // Secondary - Professional Gray-Blue
        secondary: {
          DEFAULT: '#2C3E50',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Status Colors
        success: {
          DEFAULT: '#27AE60',
          light: '#52C788',
          dark: '#1E8449',
          bg: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#F39C12',
          light: '#F5B041',
          dark: '#CA6F1E',
          bg: '#FFF3E0',
        },
        error: {
          DEFAULT: '#E74C3C',
          light: '#EC7063',
          dark: '#C0392B',
          bg: '#FFEBEE',
        },
        info: {
          DEFAULT: '#3498DB',
          light: '#5DADE2',
          dark: '#2980B9',
          bg: '#E3F2FD',
        },

        // Severity Levels
        critical: {
          DEFAULT: '#E53935',
          bg: '#FFEBEE',
          border: '#E53935',
          text: '#B71C1C',
        },
        high: {
          DEFAULT: '#FB8C00',
          bg: '#FFF3E0',
          border: '#FB8C00',
          text: '#E65100',
        },
        medium: {
          DEFAULT: '#FDD835',
          bg: '#FFF9C4',
          border: '#FDD835',
          text: '#F57F17',
        },
        low: {
          DEFAULT: '#42A5F5',
          bg: '#E3F2FD',
          border: '#42A5F5',
          text: '#1565C0',
        },

        // Background
        bg: {
          DEFAULT: '#F5F5F5',
          paper: '#FFFFFF',
          dark: '#1A1A1A',
        },

        // Chart Colors
        chart: {
          red: '#E4393C',
          orange: '#FF6B35',
          yellow: '#F7B731',
          green: '#5FBB97',
          blue: '#4A90E2',
          purple: '#9B59B6',
          pink: '#E91E63',
          teal: '#1ABC9C',
        },
      },

      // Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },

      // Font Family
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['Monaco', 'Consolas', '"Courier New"', 'monospace'],
      },

      // Font Size
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },

      // Spacing (additional)
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },

      // Animation
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      // Z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
