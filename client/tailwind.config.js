/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#FBE9E8',
          surface: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.88)',
          cardHover: 'rgba(255, 255, 255, 0.98)',
          border: '#F0DFE3',
          borderDarker: '#E5CDD3',
          plum: '#2D242F',
          muted: '#6E6270',
          lime: '#E8F5E9',
          sage: '#D4EDDA',
          yellow: '#FFF8E1',
          peach: '#FFE7D1',
          pink: '#FCE4EC',
          rose: '#F8BBD0',
          lavender: '#EDE7F6',
          periwinkle: '#E8EAF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(230, 200, 210, 0.35)',
        glow: '0 0 25px 0 rgba(255, 205, 220, 0.45)',
        card: '0 2px 12px 0 rgba(190, 160, 175, 0.1)',
      },
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #FFF9DB 0%, #FFE4BA 25%, #FCE4EC 65%, #EDE7F6 100%)',
        'pastel-btn': 'linear-gradient(135deg, #FFF3C4 0%, #FFD6E0 50%, #E8D7FF 100%)',
        'pastel-lime-pink': 'linear-gradient(135deg, #E8F5E9 0%, #FFF9DB 50%, #FCE4EC 100%)',
      },
    },
  },
  plugins: [],
};
