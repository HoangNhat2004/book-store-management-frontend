import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

// Hàm helper để lấy data từ localStorage
const getWishlistFromStorage = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error("Failed to parse wishlist from localStorage", error);
        return [];
    }
};

// Hàm helper để lưu data vào localStorage
const saveWishlistToStorage = (wishlist) => {
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error("Failed to save wishlist to localStorage", error);
    }
};

const initialState = {
    wishlistItems: getWishlistFromStorage(),
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const existingItem = state.wishlistItems.find(item => item._id === action.payload._id);
            if (!existingItem) {
                state.wishlistItems.push(action.payload);
                saveWishlistToStorage(state.wishlistItems); // Lưu
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Added to Wishlist",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                Swal.fire({
                    title: "Already in Wishlist",
                    text: "This item is already in your wishlist.",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        },
        removeFromWishlist: (state, action) => {
            state.wishlistItems = state.wishlistItems.filter(item => item._id !== action.payload._id);
            saveWishlistToStorage(state.wishlistItems); // Lưu
        },
    }
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;