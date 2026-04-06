import { Server } from "socket.io";

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
                const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"],
            allowedHeaders: ['*'],
            credentials: true,
        }
    });

    let connections = {};
    let timeOnline = {};
    let message = {};

    io.on("connection", (socket) => {

        console.log("Socket connected");
        socket.on("join-call", (path, username) => {
            if (connections[path] == undefined) {
                connections[path] = [];
            }

            connections[path].push({ id: socket.id, username });

            timeOnline[socket.id] = new Date();

            connections[path].forEach(ele => {
                io.to(ele.id).emit("user-joined", socket.id, connections[path], username);
            });

            if (message[path] != undefined) {
                for (const msg of message[path]) {
                    io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg.socketIdSender);
                }
            }
        });

        socket.on("signal", (toId, sender) => {
            io.to(toId).emit("signal", socket.id, sender);
        });


        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => { // accumulator, curValue

                    if (!isFound && roomValue.some(user => user.id === socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]); //initialValue 

            if (found === true) {
                if (message[matchingRoom] === undefined) {
                    message[matchingRoom] = [];
                }

                message[matchingRoom].push({ 'sender': sender, 'data': data, 'socketIdSender': socket.id });
                console.log("message", ":", sender, data);

                for (const ele of connections[matchingRoom]) {
                    io.to(ele.id).emit("chat-message", data, sender, socket.id)
                }

            }
        });

        socket.on("disconnect", () => {

            let diffTime = Math.abs(timeOnline[socket.id] - new Date());

            for (const key of Object.keys(connections)) {
                const index = connections[key].findIndex(user => user.id === socket.id);

                if (index !== -1) {
                    // Send disconnect message to all users in the same room
                    for (let a = 0; a < connections[key].length; ++a) {
                        io.to(connections[key][a].id).emit('user-left', socket.id);
                    }

                    // Cleanly remove the disconnected user
                    connections[key].splice(index, 1);

                    // Clean the room if it's empty
                    if (connections[key].length === 0) {
                        delete connections[key];
                    }
                }
            }
        });
    })
    return io;
}

