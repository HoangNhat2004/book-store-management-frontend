import {  createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    // XÓA: createUserWithEmailAndPassword,
    // XÓA: signInWithEmailAndPassword,
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithPopup, // Giữ lại
    signOut 
} from "firebase/auth";
// --- THÊM IMPORT MỚI ---
import axios from 'axios';
import getBaseUrl from "../utils/baseURL"; 
// --- KẾT THÚC THÊM ---

const AuthContext =  createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- SỬA LẠI HÀM registerUser ---
    const registerUser = async (username, email, password) => {
        // Gọi API backend
        return await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username,
            email,
            password,
            role: 'user' // Đặt vai trò mặc định
        });
    }

    // --- SỬA LẠI HÀM loginUser ---
    const loginUser = async (identifier, password) => {
        // Gọi API backend
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, {
            identifier, // (username hoặc email)
            password
        });

        if (response.data && response.data.token) {
            // Lưu JWT token (chúng ta sẽ dùng nó cho API sau)
            localStorage.setItem('userToken', response.data.token);
            // Lưu user (để Navbar và PrivateRoute biết)
            setCurrentUser(response.data.user);
        }
        return response.data;
    }

    // sing up with google (Giữ nguyên, nhưng thêm logic đồng bộ)
    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
            // Đồng bộ avatar/tên lên backend
            const {email, displayName, photoURL} = result.user;
            axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                email,
                username: displayName,
                photoURL
            }).catch(err => {
                console.error("Failed to sync Google user profile to backend:", err);
            });
        }
        return result;
    }

    // logout the user (Sửa lại)
    const logout = () => {
        localStorage.removeItem('userToken'); // Xóa JWT token
        setCurrentUser(null); // Xóa user khỏi state
        return signOut(auth); // Đăng xuất cả Firebase (nếu đang đăng nhập Google)
    }

    // manage user
    useEffect(() => {
        // 1. Lắng nghe thay đổi của Firebase (cho Google Sign In)
        const unsubscribe =  onAuthStateChanged(auth, (user) => {
            if(user) {
                // Nếu là user Google, cập nhật state
                setCurrentUser(user);
                // (Logic đồng bộ profile đã chuyển vào hàm signInWithGoogle)
            }
            setLoading(false);
        });

        // 2. Tự động đăng nhập bằng JWT (nếu có)
        // (Chúng ta sẽ cần một API /me để lấy thông tin user từ token)
        // (Hiện tại, để đơn giản, chúng ta sẽ tạm bỏ qua bước này,
        // PrivateRoute sẽ chỉ kiểm tra token)

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
            {!loading && children} {/* Sửa: Chỉ render khi hết loading */}
        </AuthContext.Provider>
    )
}