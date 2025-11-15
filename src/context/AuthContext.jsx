import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithRedirect, 
    getRedirectResult,  
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

    // --- SỬA LẠI: registerUser (gửi cả 3 trường) ---
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

    // --- SỬA LẠI: loginUser (lưu user vào localStorage) ---
    const loginUser = async (identifier, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, 
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); // <-- LƯU USER
            setCurrentUser(response.data.user); 
        }
        return response.data;
    }

    // --- SỬA LẠI: signInWithGoogle (dùng Redirect) ---
    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); 
    }

    // --- SỬA LẠI: logout (xóa cả user) ---
    const logout = () => {
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user'); // <-- XÓA USER
        setCurrentUser(null); 
        return signOut(auth); 
    }

    // manage user
    useEffect(() => {
        // 1. Lắng nghe thay đổi của Firebase (cho Google)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if(user) { // A. Nếu là user Google
                setCurrentUser(user); // user Google có 'displayName' và 'photoURL'
                // Đồng bộ profile
                const {email, displayName, photoURL} = user;
                axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                    email,
                    username: displayName,
                    photoURL
                }).catch(err => {
                    console.error("Failed to sync Google user profile to backend:", err);
                });
                setLoading(false);
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
                setLoading(false);
            }
        });

        // 2. Xử lý kết quả khi quay về từ Google
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    // onAuthStateChanged sẽ xử lý việc set user
                    console.log("Logged in via redirect:", result.user);
                }
            }).catch((error) => {
                if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/redirect-cancelled-by-user') {
                     console.error("Google redirect login error:", error);
                }
            });

        return () => unsubscribe();
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
            {!loading && children}
        </AuthContext.Provider>
    )
}