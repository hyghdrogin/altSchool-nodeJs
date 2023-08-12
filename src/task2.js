const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const jsonItem = path.join(__dirname, 'items.json');

// Validate request body
const validAttribute = (item) => {
    return (
      item.name && typeof item.name === 'string' &&
      item.price && typeof item.price === 'number' &&
      item.size && ['small', 'medium', 'large'].includes(item.size)
    );
}

const requestHandler = async (req, res) => {
  try {
    // Create item
    if (req.method === 'POST' && req.url === '/items') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', async () => {
        const newItem = JSON.parse(body);
        if (validAttribute(newItem)) {
          let itemsData = ''
          itemsData = await fs.promises.readFile(jsonItem, 'utf8');
          if (!itemsData) {
            itemsData = '[]';
          }
          const items = JSON.parse(itemsData);
          const highestId = items.reduce((maxId, item) => Math.max(maxId, parseInt(item.id)), 0);

          newItem.id = highestId + 1;
          items.push(newItem);
          await fs.promises.writeFile(jsonItem, JSON.stringify(items, null, 2), 'utf8');
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newItem));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid item data' }));
        }
      });
      // Get all items
    } else if (req.method === 'GET' && req.url === '/items') {
      const itemsData = await fs.promises.readFile(jsonItem, 'utf8');
      const items = JSON.parse(itemsData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
      // Get one item
    } else if (req.method === 'GET' && req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      const itemsData = await fs.promises.readFile(jsonItem, 'utf8');
      console.log("id:", itemId);
      const items = JSON.parse(itemsData);
      const item = items.find(item => item.id === itemId);
      if (item) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Item Not Found');
      }
      // Update item
    } else if (req.method === 'PUT' && req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      const itemsData = await fs.promises.readFile(jsonItem, 'utf8');
      const items = JSON.parse(itemsData);
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          const updatedItem = JSON.parse(body);
          if (validAttribute(updatedItem)) {
            items[itemIndex] = { ...items[itemIndex], ...updatedItem };
            await fs.promises.writeFile(jsonItem, JSON.stringify(items, null, 2), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(items[itemIndex]));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid item data' }));
          }
        });
      }
      // Delete item
    } else if (req.method === 'DELETE' && req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      const itemsData = await fs.promises.readFile(jsonItem, 'utf8');
      const items = JSON.parse(itemsData);
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const deletedItem = items.splice(itemIndex, 1)[0];
        await fs.promises.writeFile(jsonItem, JSON.stringify(items, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(deletedItem));
      }
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