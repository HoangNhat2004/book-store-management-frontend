// src/firebase/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // THÊM DÒNG NÀY
// import { getAnalytics } from "firebase/analytics"; // Có thể bỏ nếu không dùng

// Firebase config từ project của bạn
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDERID,
  appId: import.meta.env.VITE_APPID,
  // measurementId: import.meta.env.VITE_MEASUREMENT_ID, // Nếu dùng Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth (QUAN TRỌNG!)
export const auth = getAuth(app);

// Nếu bạn dùng Analytics (tùy chọn)
// const analytics = getAnalytics(app);
// export { analytics };