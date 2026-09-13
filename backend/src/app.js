import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Application Routes
app.use('/', routes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred.'
  });
});

export default app;
