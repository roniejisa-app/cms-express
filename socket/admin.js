const { MessageAdmin, User } = require('../models/index');
async function computeUserIdFromHeaders(userId) {
    return userId;
}

function eD(data) {
    let randomString = Math.random().toString(36).toString(36).substring(2) + new Date().getTime().toString(36).substring(2);
    let startString = randomString.slice(3, 8);
    let endString = randomString.slice(9, 15);
    data = btoa(btoa(endString + btoa(startString + btoa(encodeURIComponent(JSON.stringify(data))) + endString).split("").reverse().join("-") + startString).split("").reverse().join("?"));
    return data;
}

function dD(base64Data) {
    let firstDecode = atob(atob(base64Data).split("?").reverse().join(""));
    let secondDecode = atob(firstDecode.slice(6, -5).split("-").reverse().join(""));
    let threeDecode = atob(secondDecode.slice(5, -6));
    let data = JSON.parse(decodeURIComponent(threeDecode));
    return data;
}

module.exports = {
    socketAdmin: function (io) {
        const users = [];
        const rooms = [];
        io.on('connection', async (socket) => {
            socket.on('disconnect', () => {
                const index = users.findIndex(id => {
                    return id === socket.id;
                });
                if (index !== -1) {
                    users.splice(index, 1);
                }
            });

            socket.on('connect-admin-socket', async (room, userId, callback) => {
                // Kiểm tra room đã tồn tại, và user trong room
                let indexRoom = rooms.findIndex(roomData => {
                    return roomData.name === room;
                });
                if (indexRoom === -1) {
                    indexRoom = rooms.length;
                    rooms[indexRoom] = {
                        name: room,
                        users: []
                    }
                }

                var checkHasUser = true;
                let indexUser = rooms[indexRoom].users.findIndex(({ id }) => id === +userId);
                if (indexUser === -1) {
                    checkHasUser = false;
                    indexUser = rooms[indexRoom].users.length;
                }
                if (!checkHasUser) {
                    let user = await User.findOne({
                        attributes: ["fullname", 'id', 'avatar', 'email'],
                        where: {
                            id: userId
                        }
                    })
                    user = Object.assign({}, user.dataValues, { socketId: socket.id });
                    rooms[indexRoom].users.push(user);
                } else {
                    rooms[indexRoom].users[indexUser].socketId = socket.id;
                }
                socket.join(rooms[indexRoom].name);
                io.to(rooms[indexRoom].name).emit("join room success", "Chào mừng bạn đã quay trở lại!");
            })

            socket.on("join", (data) => {
                socket.emit("join", data);
            })

            socket.on("chat-admin-socket", async (room, userId, data) => {
                const message = await MessageAdmin.create({
                    message: dD(data),
                    user_id: userId
                })
                const roomCurrent = rooms.find(({ name }) => name === room);
                const user = roomCurrent.users.find(({ id }) => id === +userId);
                const dataEmit = {
                    data: message.dataValues,
                    user
                }
                let dataEncode = eD(dataEmit);
                io.to(room).emit("chat-admin-client", dataEncode);
            })
        });
    }
}