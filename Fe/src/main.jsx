import '@mantine/core/styles.css'; // <-- thêm dòng này lên đầu
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <MantineProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </MantineProvider>
)