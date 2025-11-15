import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
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

    // 1. Dùng backend cho register (NHẬN 3 TRƯỜNG)
    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email: email, // Nhận email (giả) từ Register.jsx
            password,
            role: 'user' 
        });
        
        if (response.data.message !== "User registered successfully") {
            throw new Error(response.data.message);
        }
        return response.data;
    }

    // 2. Dùng backend cho login (JWT)
    const loginUser = async (identifier, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, 
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
            setCurrentUser(response.data.user); 
        }
        return response.data;
    }

    // 3. Dùng signInWithRedirect cho Google
    const signInWithGoogle = async () => {
        return await signInWithRedirect(auth, googleProvider); 
    }

    // 4. Logout (xóa cả JWT)
    const logout = () => {
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user'); 
        setCurrentUser(null); 
        return signOut(auth); 
    }

    // 5. useEffect (Quản lý cả 2 loại user)
    useEffect(() => {
        let isMounted = true; 
        
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;

            if(user) { // A. Nếu là user Google
                setCurrentUser(user);
                setLoading(false);
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

        // Xử lý kết quả khi quay về từ Google
        getRedirectResult(auth)
            .then((result) => {
                if (result && isMounted) {
                    console.log("Logged in via redirect:", result.user);
                    // (Logic chuyển hướng sẽ do App.jsx xử lý)
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