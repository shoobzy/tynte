import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import { HomePage } from './pages/HomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/app/*',
    element: <App />,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
