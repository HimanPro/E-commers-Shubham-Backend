const app = require('./app');
const http = require('http');
const config = require('./config/config');

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});