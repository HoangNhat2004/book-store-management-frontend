import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

// === THÊM: Hàm helper để lấy data từ localStorage ===
const getCartFromStorage = () => {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
    }
};

// === THÊM: Hàm helper để lưu data vào localStorage ===
const saveCartToStorage = (cart) => {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
};

// === SỬA: initialState bây giờ lấy từ localStorage ===
const initialState = {
    cartItems: getCartFromStorage(), // <-- ĐÃ SỬA
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            
            if (!existingItem) {
                // Nếu chưa có, thêm mới với số lượng là 1
                state.cartItems.push({ ...action.payload, quantity: 1 })
            } else {
                // Nếu đã có, chỉ tăng số lượng lên 1
                existingItem.quantity += 1;
            }

            // === THÊM: Lưu vào localStorage sau khi thêm ===
            saveCartToStorage(state.cartItems);

            // Luôn luôn hiển thị thông báo thành công
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
            // === THÊM: Lưu vào localStorage sau khi xóa ===
            saveCartToStorage(state.cartItems);
        },
        clearCart: (state) => {
            state.cartItems = [];
            // === THÊM: Xóa localStorage sau khi clear ===
            saveCartToStorage(state.cartItems);
        },
        updateQuantity: (state, action) => {
            const { _id, quantity } = action.payload;
            const item = state.cartItems.find(item => item._id === _id);
            if (item && quantity > 0) {
                item.quantity = quantity;
            }
            // === THÊM: Lưu vào localStorage sau khi update ===
            saveCartToStorage(state.cartItems);
        }
    }
})

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;