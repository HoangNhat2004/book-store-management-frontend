// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwqxG_k271u_YmmZ9DOgl_DP9vPkb5TGE",
  authDomain: "book-store-management-8755e.firebaseapp.com",
  projectId: "book-store-management-8755e",
  storageBucket: "book-store-management-8755e.firebasestorage.app",
  messagingSenderId: "544030678979",
  appId: "1:544030678979:web:b9065a6733093dd214a776",
  measurementId: "G-DXKCRN5WYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);