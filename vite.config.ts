import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'sync-urls-plugin',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/sync-urls' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const targetPath = path.resolve(__dirname, 'src/urls.json');
                  
                  // Read current to prevent unnecessary writes
                  let currentData = { storiesUrl: '', schoolsUrl: '', mediaUrl: '' };
                  if (fs.existsSync(targetPath)) {
                    currentData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
                  }
                  
                  const updatedData = {
                    storiesUrl: data.storiesUrl || currentData.storiesUrl || '',
                    schoolsUrl: data.schoolsUrl || currentData.schoolsUrl || '',
                    mediaUrl: data.mediaUrl || currentData.mediaUrl || ''
                  };
                  
                  fs.writeFileSync(
                    targetPath,
                    JSON.stringify(updatedData, null, 2)
                  );
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'ok', data: updatedData }));
                } catch (e) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: String(e) }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
