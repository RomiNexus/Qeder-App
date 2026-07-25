/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0b1120', // deepest slate, used for status bar / outer shell
          900: '#0f172a', // dark slate — base background
          800: '#1e293b', // background — card / surface layer
          700: '#334155', // borders, dividers on dark surfaces
          600: '#475569'
        },
        sky: {
          light: '#7dd3fc',
          DEFAULT: '#38bdf8', // calming blue — primary accent
          dark: '#0ea5e9'
        },
        gold: {
          light: '#fde68a',
          DEFAULT: '#fbbf24', // warm gold — secondary / highlight accent
          dark: '#d97706'
        }
      },
      fontFamily: {
        // Body / UI typeface — humanist, legible, calm
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        // Arabic script — traditional naskh calligraphic serif
        arabic: ['"Amiri"', '"Noto Naskh Arabic"', 'serif'],
        // Secondary display for headings
        display: ['"Lora"', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.2)' }
        }
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(56, 189, 248, 0.35)',
        'glow-gold': '0 0 40px -10px rgba(251, 191, 36, 0.35)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
