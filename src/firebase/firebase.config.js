// src/firebase/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // THÊM DÒNG NÀY
// import { getAnalytics } from "firebase/analytics"; // Có thể bỏ nếu không dùng

// Firebase config từ project của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAwqxG_k271u_YmmZ9DOgl_DP9vPkb5TGE",
  authDomain: "book-store-management-8755e.firebaseapp.com",
  projectId: "book-store-management-8755e",
  storageBucket: "book-store-management-8755e.firebasestorage.app",
  messagingSenderId: "544030678979",
  appId: "1:544030678979:web:b9065a6733093dd214a776",
  // measurementId: import.meta.env.VITE_MEASUREMENT_ID, // Nếu dùng Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth (QUAN TRỌNG!)
export const auth = getAuth(app);

// Nếu bạn dùng Analytics (tùy chọn)
// const analytics = getAnalytics(app);
// export { analytics };