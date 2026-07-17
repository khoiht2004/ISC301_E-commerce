require('dotenv').config();
// Restart trigger for updated Prisma Client
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupChatSocket } = require('./src/sockets/chat.socket');
const prisma = require('./src/config/prisma');
const { allowedOrigins } = require('./src/config/corsOrigins');

const PORT = process.env.PORT || 5000;

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup root namespace for general real-time events (like payments)
io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('join_staff_room', (staffId) => {
    socket.join(`staff_${staffId}`);
  });
  socket.on('join_STAFF_dashboard', () => {
    socket.join('STAFF_dashboard');
  });
});

// Setup chat namespace
app.set('io', io);
setupChatSocket(io);

// ─── Start Server ─────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log('');
  console.log('🥩 ════════════════════════════════════════');
  console.log(`🚀  Meat Shop API running on port ${PORT}`);
  console.log(`📡  http://localhost:${PORT}`);
  console.log(`🔌  Socket.io chat: /chat namespace`);
  
  const sepayKey = process.env.SEPAY_API_KEY;
  if (sepayKey === undefined) {
    console.log("SEPAY API: undefined");
  } else if (sepayKey.trim() === "") {
    console.log("SEPAY API: empty");
  } else {
    console.log(`SEPAY API: loaded (${sepayKey.substring(0, 8)}...)`);
  }
  
  console.log('🥩 ════════════════════════════════════════');
  console.log('');
});

// Background job to clean up expired prepaid orders (15 minutes timeout)
setInterval(async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    // Find orders that are in PENDING_VALIDATION status, prepaid, not paid, and created > 15 mins ago
    const expiredOrders = await prisma.order.findMany({
      where: {
        orderStatus: 'PENDING_VALIDATION',
        paymentMethod: { not: 'COD' },
        paymentStatus: { not: 'PAID' },
        createdAt: { lte: fifteenMinutesAgo }
      }
    });

    if (expiredOrders.length > 0) {
      console.log(`[Order Timeout] Found ${expiredOrders.length} expired order(s). Processing...`);
      for (const order of expiredOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            orderStatus: 'PAYMENT_FAILED',
            paymentStatus: 'FAILED'
          }
        });
        console.log(`[Order Timeout] Order ${order.orderCode} marked as PAYMENT_FAILED due to payment timeout.`);
        
        // Notify client via socket if online
        io.to(`user_${order.userId}`).emit('order_timeout', {
          orderCode: order.orderCode,
          orderStatus: 'PAYMENT_FAILED',
          paymentStatus: 'FAILED'
        });
      }
    }
  } catch (error) {
    console.error('[Order Timeout Job Error]', error);
  }
}, 60 * 1000); // Check every 60 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
