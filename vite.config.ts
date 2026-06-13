import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import type { ServerResponse } from 'node:http';

// Serves the /api/* serverless handlers during `npm run dev`. Vite alone only
// serves the SPA, so without this the live price/trade proxies 404 locally and
// the app falls back to mock. On Vercel the same handlers run natively.
function devApi(): PluginOption {
  // Map a request path prefix to its handler module.
  function resolveHandler(url: string): string | null {
    if (url.startsWith('/api/price/spot')) return '/api/price/spot.ts';
    if (url.startsWith('/api/price/history')) return '/api/price/history.ts';
    if (url.startsWith('/api/comtrade/net-trade')) return '/api/comtrade/net-trade.ts';
    return null;
  }
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res: ServerResponse, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) return next();
        const handlerPath = resolveHandler(url);
        if (!handlerPath) return next();
        void (async () => {
          try {
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
  plugins: [react(), devApi()],
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
