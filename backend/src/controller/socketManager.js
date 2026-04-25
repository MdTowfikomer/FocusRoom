import { Server } from "socket.io";
import { RoomService } from "../services/room_service.js";

const roomService = new RoomService();

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: true,
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-call", (path, username) => {
            const { user, clients, history } = roomService.joinRoom(path, socket.id, username);

            // Notify everyone in the room (including the new user)
            clients.forEach(client => {
                io.to(client.id).emit("user-joined", socket.id, clients, username, user.timeJoined);
            });

            // Send chat history to the joining user
            history.forEach(msg => {
                socket.emit("chat-message", msg.data, msg.sender, msg.socketIdSender);
            });
        });

        socket.on("signal", (toId, data) => {
            io.to(toId).emit("signal", socket.id, data);
        });

        socket.on("chat-message", (data, sender) => {
            const result = roomService.addMessage(socket.id, sender, data);
            if (result) {
                const { recipients, message } = result;
                recipients.forEach(client => {
                    io.to(client.id).emit("chat-message", message.data, message.sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            const result = roomService.leaveRoom(socket.id);
            if (result) {
                const { recipients } = result;
                recipients.forEach(client => {
                    io.to(client.id).emit("user-left", socket.id);
                });
            }
        });
    });

    return io;
}
