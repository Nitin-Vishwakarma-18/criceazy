import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { WebSocketServer, WebSocket } from 'ws';

function auctionWsPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  let canonicalAuctionState: any = null;

  return {
    name: 'auction-ws-plugin',
    configureServer(server) {
      // 1. In-memory HTTP endpoint for zero-latency snapshot recovery
      server.middlewares.use('/api/auction/state', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.end(JSON.stringify(canonicalAuctionState || {}));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              canonicalAuctionState = data.payload || data;
              const senderClientId = req.headers['x-client-id'] || data.clientId;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, timestamp: Date.now() }));

              // Broadcast update to all WebSocket clients except the sender
              if (wss) {
                const msgStr = JSON.stringify({
                  type: 'STATE_SYNC',
                  payload: canonicalAuctionState,
                  clientId: senderClientId,
                });
                for (const client of wss.clients) {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(msgStr);
                  }
                }
              }
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });

      // 2. WebSocket Server for event-driven real-time pushes
      wss = new WebSocketServer({ noServer: true });
      server.httpServer?.on('upgrade', (request, socket, head) => {
        if (request.url?.startsWith('/ws/auction')) {
          wss?.handleUpgrade(request, socket, head, (ws) => {
            wss?.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws) => {
        // Immediately hydrate new or reconnected client with latest state snapshot
        if (canonicalAuctionState && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              type: 'STATE_SYNC',
              payload: canonicalAuctionState,
              clientId: 'server',
            }));
          } catch (e) {
            console.error('Error sending initial state snapshot to client:', e);
          }
        }

        ws.on('message', (message) => {
          try {
            const msgStr = message.toString();
            const data = JSON.parse(msgStr);

            // If client asks for full state sync
            if (data.type === 'REQUEST_SYNC') {
              if (canonicalAuctionState && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'STATE_SYNC',
                  payload: canonicalAuctionState,
                  clientId: 'server',
                }));
              }
              return;
            }

            // If state sync update, persist to in-memory canonical store
            if (data.type === 'STATE_SYNC' && data.payload) {
              canonicalAuctionState = data.payload;
            }

            // Relay message to all other connected clients
            if (wss) {
              for (const client of wss.clients) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(msgStr);
                }
              }
            }
          } catch (e) {
            console.error('Error handling WS message:', e);
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), auctionWsPlugin()],
});
