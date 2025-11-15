import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
// 1. IMPORT ĐÚNG CÁC HÀM CẦN THIẾT
import { 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithPopup, // <-- Quay lại dùng Popup
    signOut 
} from "firebase/auth";
import axios from 'axios';
import getBaseUrl from "../utils/baseURL"; 

const AuthContext =  createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 2. SỬA LẠI: Dùng backend cho register (YÊU CẦU EMAIL) ---
    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email: email, // Gửi email
            password,
            role: 'user' 
        });
        
        if (response.data.message !== "User registered successfully") {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    // --- 3. SỬA LẠI: Dùng backend cho login (JWT) ---
    const loginUser = async (identifier, password) => {
        // 'identifier' có thể là username hoặc email
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, 
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); // LƯU USER
            setCurrentUser(response.data.user); 
        }
        return response.data;
    }

    // --- 4. GIỮ LẠI: Dùng signInWithPopup cho Google ---
    const signInWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider)
    }

    // --- 5. SỬA LẠI: logout (xóa cả JWT) ---
    const logout = () => {
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user'); // XÓA USER
        setCurrentUser(null); 
        return signOut(auth); 
    }

    // --- 6. SỬA LẠI: useEffect (Quản lý cả 2 loại user) ---
    useEffect(() => {
        let isMounted = true; // Cờ để tránh set state khi component đã unmount
        
        // Lắng nghe thay đổi của Firebase (cho Google)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;

            if(user) { // A. Nếu là user Google
                setCurrentUser(user);
                setLoading(false); // Dừng loading ngay
                // Đồng bộ profile
                const {email, displayName, photoURL} = user;
                axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                    email,
                    username: displayName,
                    photoURL
                }).catch(err => {
                    console.error("Failed to sync Google user profile to backend:", err);
                });
            } else {
                // B. Không phải user Google -> Kiểm tra JWT token
                const token = localStorage.getItem('userToken');
                const storedUser = localStorage.getItem('user');
                
                if (token && storedUser) {
                    try {
                       // Khôi phục user từ localStorage (user JWT có 'username' và 'email')
                       setCurrentUser(JSON.parse(storedUser));
                    } catch (e) {
                       console.error("Failed to parse stored user", e);
                       localStorage.removeItem('userToken');
                       localStorage.removeItem('user');
                    }
                }
                setLoading(false); // Dừng loading
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []) // Mảng rỗng


    const value = {
        currentUser,
        loading,
        registerUser,
        loginUser,
        signInWithGoogle,
        logout
    }
    return (
        <AuthContext.Provider value={value}>
            {/* Sửa lại: Phải là !loading */}
            {!loading && children} 
        </AuthContext.Provider>
    )
}