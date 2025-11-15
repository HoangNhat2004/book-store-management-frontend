import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    // Xóa các hàm cũ của Firebase
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithRedirect, // Dùng Redirect
    getRedirectResult,  // Dùng Redirect
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

    // --- SỬA LẠI: Dùng backend cho register ---
    const registerUser = async (username, password) => {
        // Gửi request đến backend (chỉ username/password)
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email: null, // Gửi email là null như đã sửa
            password,
            role: 'user' 
        });
        
        if (response.data.message !== "User registered successfully") {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    // --- SỬA LẠI: Dùng backend cho login ---
    const loginUser = async (identifier, password) => {
        // 'identifier' có thể là username hoặc email
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, 
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); // Lưu JWT Token
            setCurrentUser(response.data.user); // Cập nhật user từ CSDL
        }
        return response.data;
    }

    // --- SỬA LẠI: Dùng signInWithRedirect cho Google ---
    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); // Dùng Redirect
    }

    // --- SỬA LẠI: logout (xóa cả JWT token) ---
    const logout = () => {
        localStorage.removeItem('userToken'); // Xóa JWT token
        setCurrentUser(null); 
        return signOut(auth); // Đăng xuất cả Firebase
    }

    // manage user
    useEffect(() => {
        // 1. Lắng nghe thay đổi của Firebase (cho Google)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if(user) { // Nếu là user Google
                setCurrentUser(user);
                // Đồng bộ profile
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

        // 2. Xử lý kết quả khi quay về từ Google
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    // Logic chuyển hướng sẽ được xử lý ở App.jsx
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