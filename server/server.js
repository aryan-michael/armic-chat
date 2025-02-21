const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors: {
    //     origin: "https://chat.aryanmichael.com",
    //     methods: ["GET", "POST"]
    // }
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

//app.use(cors({ origin: 'https://chat.aryanmichael.com' }));
app.use(cors({ origin: 'http://localhost:3001' }));

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Testing!");
});

const rooms = {};

const emitOpenRooms = () => {
    const openRoomList = Object.keys(rooms);
    io.emit('updateRooms', openRoomList);
};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    let userAlias = `User ${socket.id}`;

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

    socket.on('joinRoom', (roomName) => {
        if (!rooms[roomName]) {
            socket.emit('roomNotFoundError', `Room "${roomName}" not found.`);
            return;
        }

        socket.join(roomName);
        socket.roomName = roomName;

        console.log(`User ${socket.id} joined room: ${roomName}`);

        const room = rooms[roomName];

        socket.emit('roomJoined', {
            messages: room.messages
        });

        emitOpenRooms();
    });

    socket.on('setAlias', (alias) => {
        userAlias = alias;
        socket.userAlias = alias;

        io.to(socket.id).emit('receiveMessage', {
            alias: 'System',
            message: `You (@${socket.userAlias}) joined the room.`
        });

        if (socket.roomName) {
            socket.broadcast.to(socket.roomName).emit('receiveMessage', {
                alias: 'System',
                message: `@${alias} joined the room.`
            });
        }
    });

    socket.on('sendMessage', (data) => {
        const { roomName, alias, message } = data;
        const newMessage = { alias, message };

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

        const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        if (roomSize === 0) {
            delete rooms[roomName];
            console.log(`Room : ${roomName} deleted because all users left`);
        }

        emitOpenRooms();
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);

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
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});