const app = require('./app');
const { PORT } = require('./config/env');
const connectDB = require('./config/db');

const port = PORT || 5000;

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`CampusOS server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
