import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import axios from 'axios';
import getBaseUrl from "../utils/baseURL";
import { useDispatch, useSelector } from 'react-redux';
import { loadCartFromStorage, clearCart } from '../redux/features/cart/cartSlice';
import cartApi from '../redux/features/cart/cartApi'; 
import Loading from "../components/Loading"; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvide = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    
    const localCartItems = useSelector(state => state.cart.cartItems);

    // Hàm đồng bộ (Chạy ngầm)
    const syncLocalCartToDB = async (token) => {
        const savedCart = localStorage.getItem('cart');
        const cartItems = savedCart ? JSON.parse(savedCart) : [];

        if (cartItems.length > 0) {
            try {
                for (const item of cartItems) {
                    await axios.post(`${getBaseUrl()}/api/cart/add`, 
                        { productId: item._id, quantity: item.quantity },
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                }
                console.log("Synced local cart to DB successfully!");
                
                localStorage.removeItem("cart"); 
                dispatch(clearCart()); 
                dispatch(cartApi.util.invalidateTags(['Cart']));
            } catch (error) {
                console.error("Failed to sync cart:", error);
            }
        }
    };

    const registerUser = async (username, email, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/register`, {
            username, email, password, role: 'user' 
        });
        return response.data;
    }

    const loginUser = async (identifier, password) => {
        const response = await axios.post(`${getBaseUrl()}/api/auth/login`, { identifier, password });

        if (response.data && response.data.token) {
            const token = response.data.token;
            
            localStorage.setItem('userToken', token); 
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setCurrentUser(response.data.user);
            
            // Chạy sync nhưng không await để UI phản hồi ngay
            syncLocalCartToDB(token);
        }
        return response.data;
    }

    const signInWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider);
    }

    const logout = () => {
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('user');
        localStorage.removeItem('firebaseUser'); 
        localStorage.removeItem('cart');
        
        dispatch(clearCart());
        dispatch(cartApi.util.resetApiState());

        setCurrentUser(null); 
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    // --- QUAN TRỌNG: TẮT LOADING NGAY LẬP TỨC ---
                    setLoading(false); 
                    // ---------------------------------------------

                    // Sau đó mới chạy các việc phụ (lấy token, sync cart)
                    try {
                        const token = await user.getIdToken();
                        localStorage.setItem('userToken', token);
                        await syncLocalCartToDB(token);
                    } catch (err) {
                        console.error("Background sync error:", err);
                    }

                    const { email, displayName, photoURL } = user;
                    const userData = { email, username: displayName, photoURL };
                    localStorage.setItem('firebaseUser', JSON.stringify(userData));
                    
                    axios.post(`${getBaseUrl()}/api/profiles/upsert`, {
                        email, username: displayName, photoURL
                    }).catch(err => console.error("Sync profile err:", err));

                } else {
                    // Logic khi chưa login / logout
                    const token = localStorage.getItem('userToken');
                    const storedUser = localStorage.getItem('user');
                    
                    if (!token || !storedUser) {
                        localStorage.removeItem('firebaseUser');
                        localStorage.removeItem('userToken');
                        setCurrentUser(null);
                    } else {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setCurrentUser(parsedUser);
                        } catch (e) {
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('user');
                            setCurrentUser(null);
                        }
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Auth Check Error:", error);
                setLoading(false); // Luôn tắt loading dù có lỗi
            }
        });

        return () => unsubscribe();
    }, [dispatch]); 

    const value = { currentUser, loading, registerUser, loginUser, signInWithGoogle, logout }
    
    if (loading) return <Loading />;

    return (
        <AuthContext.Provider value={value}>
            {children} 
        </AuthContext.Provider>
    )
}