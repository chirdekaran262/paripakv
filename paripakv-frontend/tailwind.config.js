/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        'bg-white/20',
        'bg-white/30',
        'text-white/80',
        'text-white/90',
        'border-white/30'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
