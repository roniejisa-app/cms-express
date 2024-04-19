module.exports = {
    socketAdmin: function (io) {
        const users = [];
        const rooms = [];
        io.on('connection', (socket) => {
            socket.on('disconnect', () => {
                const index = users.findIndex(id => {
                    return id === socket.conn.id;
                });
                if (index !== -1) {
                    users.splice(index, 1);
                }
            });

            socket.on("join", (data) => {
                socket.emit("join", data);
            })

            socket.on("chat", (data) => {
                socket.emit("chat", data);
            })
        });
    }
}