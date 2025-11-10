// src/utils/getImgUrl.js
const getImgUrl = (imgPath) => {
  if (!imgPath) return '/placeholder-book.jpg';

  if (imgPath.startsWith('http')) return imgPath;

  const baseUrl = import.meta.env.VITE_API_URL || 'https://book-store-backend-97tz.onrender.com';
  return `${baseUrl}/uploads/${imgPath}`;
};

export default getImgUrl;