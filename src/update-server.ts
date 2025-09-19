import express from 'express';
import { generate } from './update-index';
import path from 'path';

const app = express();
const port = parseInt(process.env.PORT || '8580', 10);

// Serve the generated static site from dist/
const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Note: API endpoint removed - quickstart content is now served as static JSON files
// during development and production. The api/quickstart/*.json files are generated
// during the build process and served as static files.

app.get('/update', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const logger = (msg: string) => {
    try { res.write(msg + '\n'); } catch (e) { /* ignore */ }
  };

  try {
    await generate();
    logger('Done.');
    res.end();
  } catch (err: any) {
    logger('Error: ' + (err && err.stack ? err.stack : String(err)));
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Update server listening on port ${port}`);
});

export default app;
