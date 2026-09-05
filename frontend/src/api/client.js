import axios from 'axios'

// In development: falls back to localhost:8000
// In production:  set VITE_API_URL in frontend/.env.production before running `npm run build`
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export default api
