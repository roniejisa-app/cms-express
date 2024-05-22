const socketClient = async (io) => {
    io.on('connection', async (socket) => {
        socket.on('connect-chat', ({ room }) => {
            socket.join(room)
        })

        socket.on('chat-now', ({ room, content, username }) => {
            const rooms = io.of('/').adapter.rooms
            const roomData = rooms.get(room)
            console.log(roomData)
            io.to(room).emit('send-chat', {
                username,
                content,
                socketId: socket.id,
            })
        })

        socket.on('change-room', ({room}) => {
            socket.leave(room);
        })
    })
}

module.exports = socketClient
