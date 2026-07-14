import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import './styles.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, retry: 1, refetchOnWindowFocus: true } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><App /></BrowserRouter></AuthProvider></QueryClientProvider></StrictMode>,
)
