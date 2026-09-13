import app from './src/app.js';
import { config } from './src/config/environment.js';

const server = app.listen(config.port, () => {
  console.log(`[OmniPulse Server] Running on http://localhost:${config.port}`);
  console.log(`[OmniPulse Server] Environment: ${config.nodeEnv}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
