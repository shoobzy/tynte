import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '../ui/Toast'
import { useUIStore } from '../../stores/uiStore'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <Sidebar />

        <main
          className={`
            flex-1 min-h-[calc(100vh-3.5rem)]
            transition-all duration-200
            ${sidebarOpen ? 'lg:ml-0' : ''}
          `}
        >
          <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
