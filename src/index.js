const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const requestHandler = async(req, res) => {
    try {
        if (req.url === '/index.html') {
            const filePath = path.join(__dirname, 'index.html');
            const data = await fs.promises.readFile(filePath, "utf-8")
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          } else {
            const errorFilePath = path.join(__dirname, '404.html');
            res.writeHead(404, { 'Content-Type': 'text/html' });
            const data = await fs.promises.readFile(errorFilePath, "utf-8")
            res.end(data);
          }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
