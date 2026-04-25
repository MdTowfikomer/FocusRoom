/**
 * RoomService handles the logic for room membership, user state, and message history.
 * It is completely independent of the transport layer (Socket.io).
 */
class RoomService {
    constructor() {
        this.rooms = {}; // { [path]: Array<{ id, username, timeJoined }> }
        this.messages = {}; // { [path]: Array<{ sender, data, socketIdSender }> }
        this.userToRoomMap = {}; // { [userId]: path }
    }

    joinRoom(path, userId, username) {
        if (!this.rooms[path]) {
            this.rooms[path] = [];
        }

        const timeJoined = new Date();
        const user = { id: userId, username, timeJoined };
        
        this.rooms[path].push(user);
        this.userToRoomMap[userId] = path;

        return {
            user,
            clients: this.rooms[path],
            history: this.messages[path] || []
        };
    }

    addMessage(userId, sender, data) {
        const path = this.userToRoomMap[userId];
        if (!path) return null;

        if (!this.messages[path]) {
            this.messages[path] = [];
        }

        const message = { sender, data, socketIdSender: userId };
        this.messages[path].push(message);

        return {
            path,
            message,
            recipients: this.rooms[path]
        };
    }

    leaveRoom(userId) {
        const path = this.userToRoomMap[userId];
        if (!path) return null;

        const usersInRoom = this.rooms[path];
        const userIndex = usersInRoom.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            usersInRoom.splice(userIndex, 1);
            delete this.userToRoomMap[userId];

            const remainingUsers = usersInRoom;
            
            if (remainingUsers.length === 0) {
                delete this.rooms[path];
                // Optional: delete message history if room empty? 
                // Keeping it for now as per current logic.
            }

            return {
                path,
                recipients: remainingUsers
            };
        }

        return null;
    }

    getRoom(path) {
        return this.rooms[path] || [];
    }
}

export { RoomService };
