import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import 'sweetalert2/dist/sweetalert2.js'

import { Provider } from 'react-redux'
import { store } from './redux/store.js'
// 1. Import AuthProvide
import { AuthProvide } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    {/* 2. Bọc AuthProvide ở đây để toàn bộ router (bao gồm /dashboard) đều dùng được */}
    <AuthProvide>
      <RouterProvider router={router} />
    </AuthProvide>
  </Provider>,
)