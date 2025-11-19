import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

// === HÀM LẤY USER KEY (email hoặc username) ===
const getUserKey = () => {
    try {
        // 1. Thử lấy từ JWT user (username/password login)
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            return parsedUser.email || parsedUser.username || null;
        }
        
        // 2. Thử lấy từ Firebase user (Google login)
        const firebaseUser = localStorage.getItem('firebaseUser');
        if (firebaseUser) {
            const parsedFirebase = JSON.parse(firebaseUser);
            return parsedFirebase.email || null;
        }
        
        return null;
    } catch (error) {
        console.error("Error getting user key:", error);
        return null;
    }
};

// === HÀM LẤY CART THEO USER ===
const getCartFromStorage = () => {
    try {
        const userKey = getUserKey();
        if (!userKey) return []; // Chưa đăng nhập → cart rỗng
        
        const cart = localStorage.getItem(`cart_${userKey}`);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
    }
};

// === HÀM LƯU CART THEO USER ===
const saveCartToStorage = (cart) => {
    try {
        const userKey = getUserKey();
        if (!userKey) {
            console.warn("No user logged in, cart not saved");
            return;
        }
        
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(cart));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
};

// === INITIAL STATE ===
const initialState = {
    cartItems: getCartFromStorage(),
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            
            if (!existingItem) {
                state.cartItems.push({ ...action.payload, quantity: 1 })
            } else {
                existingItem.quantity += 1;
            }

            saveCartToStorage(state.cartItems);

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Product Added to the Cart",
                showConfirmButton: false,
                timer: 1500
            });
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id);
            saveCartToStorage(state.cartItems);
        },
        clearCart: (state) => {
            state.cartItems = [];
            saveCartToStorage(state.cartItems);
        },
        updateQuantity: (state, action) => {
            const { _id, quantity } = action.payload;
            const item = state.cartItems.find(item => item._id === _id);
            if (item && quantity > 0) {
                item.quantity = quantity;
            }
            saveCartToStorage(state.cartItems);
        },
        // === ACTION MỚI: LOAD CART KHI LOGIN ===
        loadCartFromStorage: (state) => {
            state.cartItems = getCartFromStorage();
        }
    }
})

export const { addToCart, removeFromCart, clearCart, updateQuantity, loadCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;