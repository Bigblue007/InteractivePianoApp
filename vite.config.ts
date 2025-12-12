import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Pro MIDI API: localhost funguje bez HTTPS, ale některé prohlížeče mohou vyžadovat HTTPS
    // Pro spuštění s HTTPS použijte: npm run dev:https
    https: false
  }
})


