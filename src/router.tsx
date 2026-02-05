import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/app/*',
    element: <App />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
