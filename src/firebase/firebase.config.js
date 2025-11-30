import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Cấu hình Firebase (Đã được làm sạch, đảm bảo không có khoảng trắng thừa)
const firebaseConfig = {
  apiKey: "AIzaSyAwqxG_k271u_YmmZ9DOgl_DP9vPkb5TGE",
  authDomain: "book-store-management-8755e.firebaseapp.com",
  projectId: "book-store-management-8755e",
  storageBucket: "book-store-management-8755e.firebasestorage.app",
  messagingSenderId: "544030678979",
  appId: "1:544030678979:web:b9065a6733093dd214a776"
};

// Debug: In ra để chắc chắn code mới đã được chạy
console.log("✅ Firebase Config Loaded:", firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);