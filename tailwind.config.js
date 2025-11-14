/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- THAY THẾ TOÀN BỘ KHỐI NÀY ---
      colors: {
        'paper': '#FBF9F6',      // Màu nền (giấy cũ)
        'ink': '#33312E',       // Màu chữ (mực)
        'primary': '#045D5D',     // Màu chính (xanh teal đậm)
        'accent': '#E07A5F',      // Màu nhấn (cam đất)
        'accent-light': '#F2D4C9', // Màu nhấn nhạt (cho hover)
        'subtle': '#E8E4DD',    // Màu viền (border)
      }, 
      fontFamily: {
        'heading' : ["Merriweather", "serif"], // Phông chữ tiêu đề
        'body' : ["Inter", "sans-serif"]      // Phông chữ nội dung
      }
      // --- KẾT THÚC THAY THẾ ---
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // (Bạn đã cài cái này ở bước trước)
  ],
}