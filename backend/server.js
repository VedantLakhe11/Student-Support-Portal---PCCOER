const path = require('path');
// Load environment variables before any other imports (auto-reload trigger)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = async () => {
  const dbConnector = require('./config/db');
  await dbConnector();
};

const PORT = process.env.PORT || 5000;

// Bootstrapping function
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Listen on PORT using http server to wrap express app for sockets
  const http = require('http');
  const server = http.createServer(app);

  // Initialize Socket.IO
  const { initSocket } = require('./utils/socket');
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`[Server Running]: Port: ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Handle unhandled promise rejections safely
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[Unhandled Rejection Error]: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.info('[SIGTERM Received]: Shutting down server gracefully.');
    server.close(() => {
      console.log('[Server Closed]: Process terminated.');
      process.exit(0);
    });
  });
};

startServer();
