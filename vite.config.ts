import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import type { ServerResponse } from 'node:http';

// Serves the /api/price/* serverless handlers during `npm run dev`. Vite alone
// only serves the SPA, so without this the live price proxy 404s locally and the
// app falls back to mock. On Vercel the same handlers run natively.
function devPriceApi(): PluginOption {
  return {
    name: 'dev-price-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res: ServerResponse, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/price/')) return next();
        void (async () => {
          try {
            const handlerPath = url.startsWith('/api/price/spot')
              ? '/api/price/spot.ts'
              : '/api/price/history.ts';
            const mod = await server.ssrLoadModule(handlerPath);
            const query: Record<string, string> = {};
            new URL(url, 'http://localhost').searchParams.forEach((v, k) => (query[k] = v));
            const vReq = Object.assign(req, { query });
            const vRes = res as ServerResponse & {
              status: (code: number) => typeof vRes;
              json: (body: unknown) => typeof vRes;
            };
            vRes.status = (code: number) => {
              res.statusCode = code;
              return vRes;
            };
            vRes.json = (body: unknown) => {
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify(body));
              return vRes;
            };
            await (mod as { default: (rq: unknown, rs: unknown) => unknown }).default(vReq, vRes);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
          }
        })();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devPriceApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
