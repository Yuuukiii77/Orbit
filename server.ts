import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleGeminiReflection } from './src/api-handler.ts';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // API Route for Gemini AI pilot
  app.post('/api/reflect', async (req, res) => {
    try {
      const result = await handleGeminiReflection(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Express API error:", error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static assets in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));

    // Fallback all SPA routing to index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Orbit custom server listening on port ${port}`);
  });
}

startServer();
