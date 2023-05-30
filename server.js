const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
require("dotenv").config();
require("./config/database");
const Message = require("./models/message");
const { v4: uuidv4 } = require("uuid");
const Jam = require("./models/jam");
const Jar = require("./models/jar");
const { ObjectId } = require("mongodb");

const app = express();

// This middleware gets called automatically whenever a request gets sent to the server
app.use(logger("dev"));
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));
app.use(require("./config/checkToken"));

const port = process.env.PORT || 3001;

// api routes that link through to the controllers
app.use("/api/users", require("./routes/api/users"));
app.use("/api/jars", require("./routes/api/jars"));
app.use("/api/jams", require("./routes/api/jams"));
app.use("/api/messages", require("./routes/api/messages"));

async function storeMessage(msg) {
    // console.log("📍 storeMessage(msg) function in server.js");
    try {
        const storeMsg = await Message.create(msg);
        console.log("storeMessage() success!");
    } catch (err) {
        console.log(`The error from storeMessage() in server.js is: ${err}`);
    }
}

async function createJam(newRoom) {
    console.log("📍 createJam() function in server.js");
    try {
        const newJam = await Jam.create(newRoom);
    } catch (err) {
        console.log(`The error from createJam() in server.js is: ${err}`);
    }
}

async function renameJar(id, newName) {
    try {
        const jar = await Jar.findByIdAndUpdate(id, {
            name: newName,
        });
        const renamedJar = await Jar.findById(id);
        console.log(`renameJar() in server.js says the jar is: ${renamedJar}`);
        return renamedJar;
    } catch (err) {
        console.log(`The error from renameJar() from server.js is: ${err}`);
    }
}

// 🔗 Sidebar.jsx > Sidebar() > handleNewJarName(e) > axios.post
app.post("/rename-jar", async (req, res) => {
    const { jarId, newJarName } = req.body;
    try {
        const renamedJar = await renameJar(jarId, newJarName);
        res.json(renamedJar);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error renaming jar");
    }
});

app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = app.listen(port, function () {
    console.log(`Express app running on port ${port}`);
});

const io = require("./config/socket").init(server);

// ❌ I don't think we need to try to store rooms data in this object.
// const rooms = {};

io.on("connection", (socket) => {
    console.log(`user id: ${socket.id} has connected`);

    socket.on("createRoom", (newRoom) => {
        createJam(newRoom);

        // ❌ I don't think we need to work with the rooms object defined in server.js
        // rooms[newRoom.socket_id] = newRoom;

        io.emit("roomCreated", newRoom);
    });

    socket.on("joinRoom", (room) => {
        console.log(`User ${room.users[0]} joined room ${room.socket_id}`);

        // ❌ I don't think we need to work with the rooms object defined in server.js
        // if (!rooms[roomId]) {
        //     return;
        // }
        // rooms[roomId].users.push(socket.id);

        // ⭕️ Our alternative is to use the room object getting passed in from client-side, accessing relevant properties through dot notation - the room object will reflect the jam that is stored in the database
        socket.join(`${room.socket_id}`);

        // ❓ There is no listener in another file currently awaiting this event emitter
        io.in(`${room.socket_id}`).emit("userJoined", room);
    });

    socket.on("renameJar", async (jarId, newJarName) => {
        console.log(
            `The new jar name is ${newJarName} and the jarId is ${jarId}`
        );

        if (!mongoose.Types.ObjectId.isValid(jarId)) {
            console.log(`ERRORz`);
        }
        try {
            const renamedJar = await renameJar(jarId, newJarName);

            // Before this line looked like io.to(`jar:${jarId}`).emit, but our jars (channels) are not our socket rooms -- 'io.to' only sends to specific socket rooms, so it will only be useful when we're working with jams (threads)
            io.emit(`jarRenamed/${jarId}`, renamedJar);
        } catch (err) {
            console.log(
                `The error from socket.on("renameJar") in server.js is: ${err}`
            );
        }
    });

    socket.on("leaveRoom", (roomId) => {
        // Remove the user from the room with the given ID
        console.log(`User ${socket.id} left room ${roomId}`);
        if (!rooms[roomId]) {
            return;
        }
        rooms[roomId].users = rooms[roomId].users.filter(
            (userId) => userId !== socket.id
        );
        socket.leave(`room-${roomId}`);
        io.in(`room-${roomId}`).emit("userLeft", { roomId, userId: socket.id });
    });

    socket.on("sendMsg", (msg) => {
        storeMessage({ text: msg });
        // io.in(`room-${roomId}`).emit("newMsg", {
        //     text: msg,
        //     sender: socket.id,
        // });
        socket.broadcast.emit("newMsg", msg);
    });

    // ❌ this listener needs to be refactored utilizing the socket_id attribute of the jam object instead of the rooms object defined in server.js - though perhaps defining a user object within this file to be updated by socket events within server.js might be the way to access the necessary room IDs that need to be left upon disconnecting. Although, a user should only be within one room at a time, so only one room should need to be left when disconnect happens
    socket.on("disconnect", () => {
        console.log(`user id: ${socket.id} has disconnected`);
        for (const roomId in rooms) {
            if (rooms[roomId].users.includes(socket.id)) {
                rooms[roomId].users = rooms[roomId].users.filter(
                    (userId) => userId !== socket.id
                );
                socket.leave(`room-${roomId}`);
                io.in(`room-${roomId}`).emit("userLeft", {
                    roomId,
                    userId: socket.id,
                });
            }
        }
    });
});
