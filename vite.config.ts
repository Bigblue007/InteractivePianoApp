import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Zkontrolovat, zda má být použit HTTPS (z environment variable nebo mode)
  const useHttps = process.env.VITE_HTTPS === 'true' || mode === 'https';

  return {
    plugins: [
      react(),
      ...(useHttps ? [mkcert()] : []), // Přidat mkcert plugin pouze pro HTTPS
    ],
    server: {
      port: 3000,
      https: useHttps,
      // Pro MIDI API: localhost funguje bez HTTPS, ale některé prohlížeče (Firefox) mohou vyžadovat HTTPS
      // Pro spuštění s HTTPS použijte: npm run dev:https
    }
  };
})


