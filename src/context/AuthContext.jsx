import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    createUserWithEmailAndPassword,
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import axios from 'axios';
import getBaseUrl from "../utils/baseURL";
// === 1. IMPORT DISPATCH VÀ ACTIONS ===
import { useDispatch } from 'react-redux';
import { loadCartFromStorage, clearCart } from '../redux/features/cart/cartSlice';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // === 2. KHỞI TẠO DISPATCH ===
    const dispatch = useDispatch();

    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email: email,
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
            identifier, 
            password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('userToken', response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setCurrentUser(response.data.user);
            
            // === 3. LOAD CART SAU KHI LOGIN ===
            dispatch(loadCartFromStorage());
        }
        return response.data;
    }

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        
        // === 4. LOAD CART SAU KHI GOOGLE LOGIN ===
        dispatch(loadCartFromStorage());
        
        return result;
    }

    const logout = () => {
        // === 5. LẤY USER KEY TRƯỚC KHI XÓA ===
        const getUserKey = () => {
            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const parsedUser = JSON.parse(user);
                    return parsedUser.email || parsedUser.username || null;
                }
                return null;
            } catch {
                return null;
            }
        };
        
        const userKey = getUserKey();
        
        // === 6. XÓA CART CỦA USER KHỎI LOCALSTORAGE ===
        if (userKey) {
            localStorage.removeItem(`cart_${userKey}`);
        }
        
        // === 7. CLEAR CART TRONG REDUX ===
        dispatch(clearCart());
        
        // === 8. XÓA TOKEN VÀ USER ===
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseUser');
        setCurrentUser(null); 
        
        return signOut(auth); 
    }

    useEffect(() => {
        let isMounted = true; 
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!isMounted) return;

            if(user) {
                setCurrentUser(user);
                setLoading(false);
                const { email, displayName, photoURL } = user;
                const userData = { 
                    email, 
                    username: displayName, 
                    photoURL 
                };
                localStorage.setItem('firebaseUser', JSON.stringify(userData));
                
                // === 9. LOAD CART KHI GOOGLE USER LOGIN ===
                dispatch(loadCartFromStorage());
                
                const {email: userEmail, displayName: userName, photoURL: userPhoto} = user; // Đổi tên biến tránh trùng
                axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                    email: userEmail,
                    username: userName,
                    photoURL: userPhoto
                }).catch(err => {
                    console.error("Failed to sync Google user profile to backend:", err);
                });
            } else {
                // Khi không có user (hoặc vừa logout xong)
                const token = localStorage.getItem('userToken');
                const storedUser = localStorage.getItem('user');
                
                if (!token || !storedUser) {
                    // Đảm bảo xóa key rác nếu không còn token hợp lệ
                    localStorage.removeItem('firebaseUser');
                }

                if (token && storedUser) {
                    try {
                       const parsedUser = JSON.parse(storedUser);
                       setCurrentUser(parsedUser);
                       dispatch(loadCartFromStorage());
                    } catch (e) {
                       console.error("Failed to parse stored user", e);
                       localStorage.removeItem('userToken');
                       localStorage.removeItem('user');
                    }
                }
                setLoading(false); 
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [dispatch]) // Thêm dispatch vào dependency

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