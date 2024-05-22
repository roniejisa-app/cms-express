const { Message, chatRoom, chatRoomUser, User, MessageFeelUser } = require('../models/index');
require('dotenv').config();
const fs = require('fs');
const { createFolderFromString } = require('../utils/uploadFile');
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

async function createMessage(io, { dataDecode, roomCurrent, user, type }) {
    const message = await Message.create({
        message: dataDecode,
        user_id: user.id,
        chat_room_id: roomCurrent.roomData.id,
        type
    })
    const dataEmit = {
        data: message.dataValues,
        user
    }
    let dataSend = eD(dataEmit);
    io.to(roomCurrent.name).emit("chat-admin-client", dataSend);
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

            socket.on('connect-admin-socket', async (room, userId) => {
                // Kiểm tra room đã tồn tại, và user trong room
                let indexRoom = rooms.findIndex(roomData => {
                    return roomData.name === room;
                });


                if (indexRoom === -1) {
                    let [roomChat, createRoomChat] = await chatRoom.findOrCreate({
                        where: {
                            key: room
                        },
                        defaults: {
                            key: room,
                            user_id: userId
                        }
                    })
                    indexRoom = rooms.length;
                    rooms[indexRoom] = {
                        name: room,
                        roomData: roomChat,
                        users: []
                    }
                }

                // Kiểm tra nếu userId đã có thì bỏ
                let checkRoomUser = await chatRoomUser.findOne({
                    where: {
                        user_id: 2,
                        chat_room_id: rooms[indexRoom].roomData.id
                    }
                })
                if (checkRoomUser) {
                    rooms[indexRoom].roomData.addUsers([userId])
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

                // Lấy lại thông tin chat cũ của room 5 tin trước
                let limit = 10;
                let offset = 0
                let { count, rows } = await Message.findAndCountAll({
                    where: {
                        chat_room_id: rooms[indexRoom].roomData.id,
                    },
                    include: [
                        {
                            model: User,
                            attributes: ["avatar", "fullname", "id", "email"],
                            as: "user"
                        }, {
                            model: MessageFeelUser,
                            as: "feels"
                        }
                    ],
                    order: [["id", "DESC"]],
                    offset,
                    limit,
                })

                let listMessages = [];
                rows.reverse().forEach(row => {
                    let user = row.dataValues.user;
                    if (user.id === +userId) {
                        user = rooms[indexRoom].users[indexUser]
                    }
                    listMessages.push({
                        data: row.dataValues,
                        user
                    })
                })
                let dataResponse = eD(listMessages);
                socket.join(rooms[indexRoom].name);
                socket.emit("join room success", dataResponse);
            })

            socket.on("load-more-message", async (room, userId, page) => {
                let dataResponse = null;
                let indexRoom = rooms.findIndex(roomData => {
                    return roomData.name === room;
                });

                if (indexRoom === -1) {
                    dataResponse = [];
                    dataResponse = eD(dataResponse);
                } else {
                    let indexUser = rooms[indexRoom].users.findIndex(({ id }) => id === +userId);
                    let limit = 10;
                    let offset = (+page - 1) * limit;
                    let { count, rows } = await Message.findAndCountAll({
                        where: {
                            chat_room_id: rooms[indexRoom].roomData.id,
                        },
                        include: [
                            {
                                model: User,
                                attributes: ["avatar", "fullname", "id", "email"],
                                as: "user"
                            }, {
                                model: MessageFeelUser,
                                as: "feels"
                            }
                        ],
                        order: [["id", "DESC"]],
                        offset,
                        limit
                    })

                    let listMessages = [];
                    rows.forEach(row => {
                        let user = row.dataValues.user;
                        if (user.id === +userId) {
                            user = rooms[indexRoom].users[indexUser]
                        }
                        listMessages.push({
                            data: row.dataValues,
                            user
                        })
                    })
                    dataResponse = eD(listMessages);
                }
                io.to(rooms[indexRoom].name).emit("response-message-load", dataResponse);
            })

            socket.on("join", (data) => {
                socket.emit("join", data);
            })

            socket.on("chat-admin-socket", async (room, userId, data, type) => {
                const roomCurrent = rooms.find(({ name }) => name === room);
                const user = roomCurrent.users.find(({ id }) => id === +userId);

                let dataDecode = dD(data);
                if (type === 'file') {
                    const files = dataDecode.files;
                    for (let i = 0; i < dataDecode.files.length; i++) {
                        let { type: typeFile, size, base64 } = files[i];
                        let typeReal = typeFile.split('/').pop();
                        if (process.env.FILE_UPLOAD_ACCEPT.split(',').includes(typeReal)) {
                            // Thêm folder messages;
                            const folderPath = 'messages';
                            createFolderFromString(folderPath);
                            const ext = base64.substring(base64.indexOf("/") + 1, base64.indexOf(";base64"));
                            const fileType = base64.substring("data:".length, base64.indexOf("/"));
                            const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');
                            const base64Data = base64.replace(regex, "");
                            let randomString = Math.random().toString(36).toString(36).substring(2) + new Date().getTime().toString(36).substring(2);
                            const fileAbsolute = folderPath + '/' + randomString + '.' + typeReal;
                            fs.writeFileSync(process.cwd() + process.env.FOLDER_UPLOAD_SERVER + '/' + fileAbsolute, base64Data, "base64");
                            createMessage(io, {
                                dataDecode: `/uploads/` + fileAbsolute,
                                user,
                                roomCurrent,
                                type: 'image'
                            })
                        }

                    }
                    if (dataDecode.stringData) {
                        createMessage(io, {
                            dataDecode: dataDecode.stringData,
                            user,
                            roomCurrent,
                            type: 'message',
                        })
                    }
                } else {
                    createMessage(io, {
                        dataDecode,
                        user,
                        roomCurrent,
                        type
                    })
                }
            })
            // Feel
            socket.on("feel-message", async (room, userId, messageId, native) => {
                const roomCurrent = rooms.find(({ name }) => name === room);
                if (roomCurrent) {
                    let feelData = await MessageFeelUser.findOne({
                        where: {
                            user_id: userId,
                            message_id: messageId
                        }
                    })

                    if (!feelData) {
                        feelData = await MessageFeelUser.create({
                            user_id: userId,
                            message_id: messageId,
                            native
                        })
                    } else if (feelData.native !== native) {
                        await feelData.update({ native })
                    }
                    io.to(roomCurrent.name).emit('feel-message-response', eD(feelData))
                }
            })
        });
    }
}