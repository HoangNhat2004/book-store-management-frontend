// src/utils/getImgUrl.js
const getImgUrl = (imgPath) => {
  if (!imgPath) return '/placeholder-book.jpg';

  // Nếu đã là URL đầy đủ (http/https) → trả về luôn
  if (imgPath.startsWith('http')) return imgPath;

  // Nếu là ảnh từ frontend assets → dùng new URL
  if (imgPath.startsWith('books/') || imgPath.includes('.png') || imgPath.includes('.jpg')) {
    try {
      return new URL(`../assets/books/${imgPath.split('/').pop()}`, import.meta.url).href;
    } catch {
      // Nếu không tìm thấy trong assets → fallback
    }
  }

  // ẢNH TỪ BACKEND: thêm base URL + /uploads
  const baseUrl = import.meta.env.VITE_API_URL || 'https://book-store-backend-97tz.onrender.com';
  return `${baseUrl}/uploads/${imgPath}`;
};

export default getImgUrl;