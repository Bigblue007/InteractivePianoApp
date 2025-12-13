import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Zkontrolovat, zda má být použit HTTPS (z environment variable nebo mode)
  const useHttps = process.env.VITE_HTTPS === 'true' || mode === 'https';

  return {
    plugins: [
      react(),
      ...(useHttps ? [mkcert()] : []), // Přidat mkcert plugin pouze pro HTTPS
      // Plugin pro správné servování MP3 souborů s '#' v názvech
      {
        name: 'mp3-mime-type',
        configureServer(server) {
          // Middleware pro servování MP3 souborů s '#' v názvech
          // Musí být před Vite's static middleware
          server.middlewares.use((req, res, next) => {
            if (req.url?.endsWith('.mp3')) {
              // Zkontrolovat, zda URL obsahuje %23 (zakódované #) nebo přímo #
              const hasEncodedHash = req.url.includes('%23');
              const hasDirectHash = req.url.includes('#');
              
              if (hasEncodedHash || hasDirectHash) {
                try {
                  // Pokud obsahuje %23, dekódovat; pokud obsahuje přímo #, použít tak
                  let decodedUrl = req.url;
                  if (hasEncodedHash) {
                    decodedUrl = decodeURIComponent(req.url);
                  }
                  
                  // Zkusit najít soubor přímo z public adresáře
                  const publicPath = join(process.cwd(), 'public', decodedUrl);
                  try {
                    const fileContent = readFileSync(publicPath);
                    res.setHeader('Content-Type', 'audio/mpeg');
                    res.setHeader('Content-Length', fileContent.length.toString());
                    res.end(fileContent);
                    return; // Ukončit middleware chain
                  } catch (fsError: any) {
                    // Pokud soubor nenajdeme, zkusit použít dekódované URL pro Vite server
                    req.url = decodedUrl;
                  }
                } catch (e) {
                  // Pokud dekódování selže, použít původní URL
                }
              }
              // Nastavit Content-Type pro všechny MP3 soubory
              res.setHeader('Content-Type', 'audio/mpeg');
            }
            next();
          });
        },
      },
    ],
    server: {
      port: 3000,
      https: useHttps,
      // Pro MIDI API: localhost funguje bez HTTPS, ale některé prohlížeče (Firefox) mohou vyžadovat HTTPS
      // Pro spuštění s HTTPS použijte: npm run dev:https
    },
    // Zajistit, že Vite správně servuje MP3 soubory
    assetsInclude: ['**/*.mp3'],
  };
})


