let totalUserReady = {};
let userStream = [];
module.exports = (io) => {
    io.on("connection", socket => {
        socket.on("join", roomName => {
            socket.join(roomName);
            const room = getRoom(roomName);
            const otherUsers = Array.from(room).filter(socketId => socketId !== socket.id);
            if (!totalUserReady[roomName + "-call"] || totalUserReady[roomName + "-call"].length > 0) {
                totalUserReady[roomName + "-call"] = [];
            }

            socket.emit("ready", otherUsers, userStream);
            for (const user of otherUsers) {
                socket.to(user).emit("update-user-list", {
                    users: [socket.id]
                });
            }

            // Kiểm tra nếu có người mới vào thì phải reset tổng số user vào
            if (!totalUserReady[roomName + "-screen"] || totalUserReady[roomName + "-screen"].length > 0) {
                totalUserReady[roomName + "-screen"] = [];
            }
        });

        socket.on("done-add", (roomName, socketId, type) => {
            const index = totalUserReady[roomName + "-" + type].findIndex(socketOld => socketOld === socketId);
            if (index === -1) {
                totalUserReady[roomName + "-" + type].push(socketId);
            }
            socket.join(roomName);
            const room = getRoom(roomName);
            if (totalUserReady[roomName + "-" + type].length == Array.from(room).length) {
                io.to(roomName).emit("done-call-start", type);
            }
        })

        socket.on("disconnect", () => {

        });

        socket.on("call-user", (data) => {
            socket.to(data.to).emit("call-made", {
                offer: data.offer,
                socket: socket.id,
            });
        });

        socket.on("make-answer", (data) => {
            socket.to(data.to).emit("answer-made", {
                socket: socket.id,
                answer: data.answer,
            });
        });

        socket.on("stream-screen", (roomName) => {
            userStream.push(socket.id);
            socket.join(roomName);
            const room = getRoom(roomName);
            const otherUsers = Array.from(room).filter(socketId => socketId !== socket.id);
            for (const to of otherUsers) {
                // Dùng hàm này để có thể tự add thêm người khi đang stream
                socket.to(to).emit("start-stream", socket.id);
            }
        })

        socket.on("add-stream-done", (roomName, to) => {
            socket.join(roomName);
            socket.to(to).emit("call-stream-now", socket.id);
        })

        socket.on("call-stream", (data) => {
            socket.to(data.to).emit("call-stream", {
                offer: data.offer,
                socket: socket.id
            });
        });

        socket.on("make-stream", (data) => {
            socket.to(data.to).emit("answer-stream", {
                socket: socket.id,
                answer: data.answer
            });
        });

        socket.on("disconnect", () => {
            socket.emit("close-socket", socket.id);
        })
    });

    function getRoom(nameRoom, nameSpace = '/') {
        const rooms = io.of(nameSpace).adapter.rooms;
        return rooms.get(nameRoom);
    }
}
