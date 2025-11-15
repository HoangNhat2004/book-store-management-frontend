import {createBrowserRouter} from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
// ... (các import khác giữ nguyên)
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import SingleBook from "../pages/books/SingleBook";
import PrivateRoute from "./PrivateRoute";
import OrderPage from "../pages/books/OrderPage";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";
import UserDashboard from "../pages/dashboard/users/UserDashboard";
import Orders from "../pages/dashboard/Orders";
import SearchPage from "../pages/SearchPage";
import WishlistPage from "../pages/books/WishlistPage";


const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>, // <-- <App> LÀ GỐC
      children: [
        {
            path: "/", // <-- Trang chủ là con
            element: <Home/>,
        },
        {
            path: "/orders",
            element: <PrivateRoute><OrderPage/></PrivateRoute>
        },
        {
            path: "/about",
            element: <div>About</div>
        },
        {
          path: "/login", // <-- Chuyển vào làm con
          element: <Login/>
        },
        {
          path: "/register", // <-- Chuyển vào làm con
          element: <Register/>
        },
        {
          path: "/cart", // <-- Chuyển vào làm con
          element: <CartPage/>
        },
        {
          path: "/checkout", // <-- Chuyển vào làm con
          element: <PrivateRoute><CheckoutPage/></PrivateRoute>
        },
        {
          path: "/books/:id", // <-- Chuyển vào làm con
          element: <SingleBook/>
        },
        {
          path: "/user-dashboard", // <-- Chuyển vào làm con
          element: <PrivateRoute><UserDashboard/></PrivateRoute>
        },
        {
          path: "/search", // <-- Chuyển vào làm con
          element: <SearchPage/>
        },
        { 
          path: "/wishlist", // <-- Chuyển vào làm con
          element: <WishlistPage/>
        }
      ]
    },
    {
      path: "/admin", // <-- Route Admin (riêng biệt, OK)
      element: <AdminLogin/>
    },
    {
      path: "/dashboard", // <-- Route Dashboard (riêng biệt, OK)
      element: <AdminRoute>
        <DashboardLayout/>
      </AdminRoute>,
      children:[
        // ... (các children của dashboard giữ nguyên)
        {
          path: "",
          element: <AdminRoute><Dashboard/></AdminRoute>
        },
        {
          path: "add-new-book",
          element: <AdminRoute>
            <AddBook/>
          </AdminRoute>
        },
        {
          path: "edit-book/:id",
          element: <AdminRoute>
            <UpdateBook/>
          </AdminRoute>
        },
        {
          path: "manage-books",
          element: <AdminRoute>
            <ManageBooks/>
          </AdminRoute>
        },
        {
          path: "orders",
          element: <AdminRoute><Orders /></AdminRoute>
        }
      ]
    }
  ]);

  export default router;