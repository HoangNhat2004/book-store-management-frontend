import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithRedirect, // Sửa lỗi COOP
    getRedirectResult,  // Sửa lỗi COOP
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

    // Dùng backend cho register (YÊU CẦU EMAIL)
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

    // Dùng backend cho login (JWT)
    const loginUser = async (identifier, password) => {
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

    // Dùng signInWithRedirect cho Google
    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); 
    }

    // Logout (xóa cả JWT)
    const logout = () => {
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user'); // XÓA USER
        setCurrentUser(null); 
        return signOut(auth); 
    }

    // manage user
    useEffect(() => {
        let isMounted = true; // Cờ để tránh set state khi component đã unmount
        
        // 1. Lắng nghe thay đổi của Firebase (cho Google)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;

            if(user) { // A. Nếu là user Google
                setCurrentUser(user);
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
                if (result && isMounted) {
                    // onAuthStateChanged sẽ xử lý việc set user
                    console.log("Logged in via redirect:", result.user);
                }
            }).catch((error) => {
                if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/redirect-cancelled-by-user') {
                     console.error("Google redirect login error:", error);
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
            {!loading && children}
        </AuthContext.Provider>
    )
}