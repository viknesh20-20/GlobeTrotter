/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff1f0',
                    100: '#ffe1df',
                    200: '#ffc8c5',
                    300: '#ffa19b',
                    400: '#ff6b6b',
                    500: '#f83b3b',
                    600: '#e51d1d',
                    700: '#c11414',
                    800: '#a01414',
                    900: '#841818',
                },
                secondary: {
                    50: '#effefb',
                    100: '#c8fff4',
                    200: '#92feec',
                    300: '#53f5e0',
                    400: '#4ecdc4',
                    500: '#06b6a8',
                    600: '#02938a',
                    700: '#067570',
                    800: '#0a5c5a',
                    900: '#0d4d4b',
                },
                accent: {
                    50: '#fffde7',
                    100: '#fffac1',
                    200: '#fff587',
                    300: '#ffe66d',
                    400: '#fed130',
                    500: '#eeb607',
                    600: '#cd8c03',
                    700: '#a46306',
                    800: '#874d0e',
                    900: '#733f12',
                },
                brandDark: {
                    50: '#f6f7f9',
                    100: '#eceef2',
                    200: '#d5dae2',
                    300: '#b0bac8',
                    400: '#8594a9',
                    500: '#66778f',
                    600: '#516076',
                    700: '#424e60',
                    800: '#394351',
                    900: '#2c3e50',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 15px rgba(78, 205, 196, 0.3)',
            },
        },
    },
    plugins: [],
}
