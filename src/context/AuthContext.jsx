import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithRedirect, 
    getRedirectResult,  // <-- Giữ lại
    signOut 
} from "firebase/auth";
import axios from 'axios';
import getBaseUrl from "../utils/baseURL"; 
// 1. XÓA useNavigate
// import { useNavigate } from "react-router-dom"; 

const AuthContext =  createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // 2. XÓA useNavigate
    // const navigate = useNavigate(); 

    // ... (logic registerUser, loginUser giữ nguyên) ...
    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email: email || null, // Sửa lại để chấp nhận user không có email
            password,
            role: 'user' 
        });
        
        if (response.data.message !== "User registered successfully") {
            throw new Error(response.data.message);
        }
        return response.data;
    }

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
    // ...

    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); 
    }

    const logout = () => {
        localStorage.removeItem('userToken'); 
        setCurrentUser(null); 
        return signOut(auth); 
    }

    // manage user
    useEffect(() => {
        // 1. Lắng nghe thay đổi của Firebase
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if(user) { 
                setCurrentUser(user);
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
                    // 3. XÓA CHUYỂN HƯỚNG
                    console.log("Logged in via redirect:", result.user);
                    // navigate("/"); // <-- XÓA DÒNG NÀY
                }
            }).catch((error) => {
                console.error("Google redirect login error:", error);
            });

        // 4. XÓA navigate KHỎI DEPENDENCY ARRAY
        return () => unsubscribe();
    }, []) // <-- Chỉ còn mảng rỗng


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