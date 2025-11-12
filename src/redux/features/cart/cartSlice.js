import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

const initialState = {
    cartItems: []
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            
            // --- BẮT ĐẦU SỬA ---
            if (!existingItem) {
                // Nếu chưa có, thêm mới với số lượng là 1
                state.cartItems.push({ ...action.payload, quantity: 1 })
            } else {
                // Nếu đã có, chỉ tăng số lượng lên 1
                existingItem.quantity += 1;
            }

            // Luôn luôn hiển thị thông báo thành công
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Product Added to the Cart",
                showConfirmButton: false,
                timer: 1500
            });
            // --- KẾT THÚC SỬA ---
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id)
        },
        clearCart: (state) => {
            state.cartItems = []
        },
        updateQuantity: (state, action) => {
            const { _id, quantity } = action.payload
            const item = state.cartItems.find(item => item._id === _id)
            if (item && quantity > 0) {
                item.quantity = quantity
            }
        }
    }
})

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;