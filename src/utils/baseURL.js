const getBaseUrl = () => {
    return import.meta.env.VITE_BASE_URL || "https://book-store-backend-97tz.onrender.com/";
}
export default getBaseUrl;