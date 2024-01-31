const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ port: 8000 });
const clients = new Map();

function get_all_users() {
    return Array.from(clients.keys()).map(username => ({username}))
}

wss.on('connection', (ws) => {

    // handle incoming messages from client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
         if (message.toString().substring(0, 5) === '/all:') {
             for (const user of clients.values()) {
                 if (user !== ws) {
                     user.send(message.toString().substring(5));
                 }
             }
         } else if (message.toString().substring(0, 8) === '/others:') {
            clients.forEach((client) => {
                if (client !== ws) {
                    client.send(JSON.stringify({
                        user: ws.toString(),
                        message: message.toString().substring(8)
                    }));
                }
            });
        } else if (message.toString() === 'get_users') {
             console.log('Someone tried to get users...')
             console.log(JSON.stringify(get_all_users()))
             ws.send(JSON.stringify(get_all_users()));
         } else if (message.toString().substring(0, 4) === 'Call') {
             const user = clients.get(message.toString().substring(4));
             
         } else if (message.toString().substring(0, 10) === 'New client') {
             const name = message.toString().substring(11);
             console.log(`Client '${name}' connected!`);

             // Save the name along with the WebSocket connection in the object
             clients.set(name, ws);

             // send welcome message to the new client
             ws.send(`Hello, ${name}!`);

             // Notify existing clients about the new client joining
             // for (const user of clients.values()) {
             //     if (user !== ws) {
             //         user.send(`${name} has joined!`);
             //     }
             // }
         } else {
             ws.send('Unknown command')
        }
    });

    // handle client disconnection
    ws.on('close', () => {
        const disconnectedClient = clients.get(ws);
        const clientName = disconnectedClient
        console.log(`${disconnectedClient} disconnected.`);

        // Remove the client from the Map
        clients.delete(ws);

        // Notify the remaining clients about the disconnection
        for (const [name, user] of clients.entries()) {
            if (user !== ws) {
                user.send(`${name} disconnected!`);
            }
        }
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
});