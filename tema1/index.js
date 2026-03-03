const http = require('node:http');
const { requestPipeline } = require('./middlewareCore');

const server = http.createServer();

server.on('request', requestPipeline);

server.on('clientError', (err, socket) => {
    console.error('Client error:', err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});