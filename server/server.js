const express = require('express');
const http = require('http');
const {
    Server
} = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://armic-chat.vercel.app"],
        methods: ["GET", "POST"]
    }
});

const PORT = 80;

app.use(cors("https://armic-chat.vercel.app"));

app.get("/", (req, res) => {
    res.send("Testing!")
})

const rooms = {};

// Function to emit the list of open rooms to all connected clients
const emitOpenRooms = () => {
    const openRoomList = Object.keys(rooms);
    io.emit('updateRooms', openRoomList);
};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    let userAlias = `User ${socket.id}`;

    // Send initial open rooms list to new client
    emitOpenRooms();

    socket.on('setAlias', (alias) => {
        userAlias = alias;
        socket.userAlias = alias;
        console.log(`User ${socket.id} set alias to ${alias}`);
    });

    socket.on('createRoom', (roomName) => {
        if (rooms[roomName]) {
            socket.emit('roomExistsError', `Room "${roomName}" already exists.`);
            return;
        }

        rooms[roomName] = {
            messages: [],
            aliases: []
        };
        socket.join(roomName);
        console.log(`Room created by ${socket.id}: ${roomName}`);
        socket.emit('roomCreated', roomName);

        rooms[roomName].aliases.push(userAlias);

        socket.emit('roomJoined', {
            messages: rooms[roomName].messages
        });

        emitOpenRooms();
    });

    // socket.on('joinRoom', (roomName) => {
    //     if (!rooms[roomName]) {
    //         socket.emit('roomNotFoundError', `Room "${roomName}" not found.`);
    //         return;
    //     }

    //     socket.join(roomName);
    //     console.log(`User ${socket.id} joined room: ${roomName}`);

    //     const room = rooms[roomName];

    //     socket.emit('roomJoined', {
    //         messages: room.messages
    //     });
    //     emitOpenRooms();
    // });

    socket.on('joinRoom', (roomName) => {
        if (!rooms[roomName]) {
            socket.emit('roomNotFoundError', `Room "${roomName}" not found.`);
            return;
        }
    
        socket.join(roomName);
        socket.roomName = roomName; // ✅ Store the room name in the socket object
    
        console.log(`User ${socket.id} joined room: ${roomName}`);
    
        const room = rooms[roomName];
    
        socket.emit('roomJoined', {
            messages: room.messages
        });
    
        emitOpenRooms();
    });
    

    // socket.on('setAlias', (alias) => {
    //     userAlias = alias;
    //     socket.userAlias = alias;

    //     io.to(socket.id).emit('receiveMessage', {
    //         alias: 'System',
    //         // message: `You joined the room.`
    //         message: `You (@${socket.userAlias}) joined the room.`
    //     });
    //     socket.broadcast.to(socket.roomName).emit('receiveMessage', {
    //         alias: 'System',
    //         message: `${alias} joined the room.`
    //     });
    // });

    socket.on('setAlias', (alias) => {
        userAlias = alias;
        socket.userAlias = alias;
    
        io.to(socket.id).emit('receiveMessage', {
            alias: 'System',
            message: `You (@${socket.userAlias}) joined the room.`
        });
    
        if (socket.roomName) { // ✅ Ensure socket.roomName is defined
            socket.broadcast.to(socket.roomName).emit('receiveMessage', {
                alias: 'System',
                message: `@${alias} joined the room.`
            });
        }
    });
    

    socket.on('sendMessage', (data) => {
        const {
            roomName,
            alias,
            message
        } = data;
        const newMessage = {
            alias,
            message
        };

        rooms[roomName].messages.push(newMessage);
        io.to(roomName).emit('receiveMessage', newMessage);
    });

    socket.on('leaveRoom', (roomName) => {
        console.log(`User Left: ${socket.id}`);
        socket.leave(roomName);
        io.to(roomName).emit('receiveMessage', {
            alias: 'System',
            message: `${userAlias} left the room.`
        });
    
        rooms[roomName].aliases = rooms[roomName].aliases.filter(alias => alias !== userAlias);
        
        // Check if room is empty after user leaves
        const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        if (roomSize === 0) {
            delete rooms[roomName];
            console.log(`Room : ${roomName} deleted because all users left`);
        }
        
        emitOpenRooms();
    });
    
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        
        // Get all room names this socket was in
        const userRooms = [...socket.rooms].filter(room => room !== socket.id);
        
        for (const roomName of userRooms) {
            if (rooms[roomName]) {
                io.to(roomName).emit('receiveMessage', {
                    alias: 'System',
                    message: `${userAlias} left the room.`
                });
                
                if (rooms[roomName].aliases) {
                    rooms[roomName].aliases = rooms[roomName].aliases.filter(alias => alias !== userAlias);
                }
            }
        }
        
        // Check all rooms to see if any are now empty
        for (const roomName in rooms) {
            const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            if (roomSize === 0) {
                delete rooms[roomName];
                console.log(`Room : ${roomName} deleted because it's empty after disconnect`);
            }
        }
        
        emitOpenRooms();
    });

    socket.on('getOpenRooms', () => {
        emitOpenRooms();
    })
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});