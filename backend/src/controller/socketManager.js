import { Server } from "socket.io";

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ['*'],
            credential: true,
        }
    }
    );

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

                    if (!isFound && roomValue.includes(socket.id)) {
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
                    io.to(ele).emit("chat-message", data, sender, socket.id)
                }

            }
        });

        socket.on("disconnect", () => {

            let diffTime = Math.abs(timeOnline[socket.id] - new Date());

            let key;

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        let index = connections[key].indexOf(socket.id);

                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        });
    })
    return io;
}

