import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    // XÓA: createUserWithEmailAndPassword,
    // XÓA: signInWithEmailAndPassword,
    GoogleAuthProvider, 
    onAuthStateChanged, 
    // signInWithPopup, // Đã bị lỗi COOP
    signInWithRedirect, // Sửa lỗi COOP
    getRedirectResult,  // Sửa lỗi COOP
    signOut 
} from "firebase/auth";
// --- THÊM IMPORT MỚI ---
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

    // --- SỬA LẠI HÀM registerUser (ĐÃ CHUYỂN SANG BACKEND) ---
    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email,
            password,
            role: 'user' 
        });
        
        if (response.data.message !== "User registered successfully") {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    // --- SỬA LẠI HÀM loginUser (CHUYỂN SANG BACKEND) ---
    const loginUser = async (identifier, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, // (username hoặc email)
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); // Lưu JWT Token
            setCurrentUser(response.data.user); // Cập nhật user từ CSDL
        }
        return response.data;
    }

    // --- SỬA LẠI HÀM GOOGLE (ĐỂ SỬA LỖI COOP) ---
    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); // Dùng Redirect
    }

    // logout the user (Sửa lại)
    const logout = () => {
        localStorage.removeItem('userToken'); // Xóa JWT token
        setCurrentUser(null); 
        return signOut(auth); // Đăng xuất cả Firebase
    }

    // manage user
    useEffect(() => {
        // 1. Lắng nghe thay đổi của Firebase (cho Google Sign In)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if(user) { // Nếu là user Google
                setCurrentUser(user);
                // Đồng bộ profile (nếu là user Google)
                const {email, displayName, photoURL} = user;
                axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                    email,
                    username: displayName,
                    photoURL
                }).catch(err => {
                    console.error("Failed to sync Google user profile to backend:", err);
                });
            }
            setLoading(false);
        });

        // 2. Xử lý kết quả khi quay về từ Google (Sửa lỗi COOP)
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    console.log("Logged in via redirect:", result.user);
                }
            }).catch((error) => {
                console.error("Google redirect login error:", error);
            });

        return () => unsubscribe();
    }, [])


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
            {!loading && children}
        </AuthContext.Provider>
    )
}