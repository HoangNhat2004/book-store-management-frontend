const getBaseUrl = () => {
    return import.meta.env.VITE_BASE_URL || "https://book-store-management-backend.onrender.com";
}
export default getBaseUrl;