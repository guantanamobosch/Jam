const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
require("dotenv").config();
require("./config/database");
const { v4: uuidv4 } = require("uuid");
const User = require("./models/user");
const Jar = require("./models/jar");
const Jam = require("./models/jam");
const Message = require("./models/message");
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

async function storeMessage(newMsg) {
    console.log("📍 storeMessage(msg) function in server.js");
    try {
        const storeMsg = await Message.create(newMsg);
        console.log("storeMessage() success!");
        return storeMsg;
    } catch (err) {
        console.log(
            `⛔️ - The error from storeMessage() in server.js is: ${err}`
        );
    }
}

async function createJam(newRoom, jarId, user) {
    console.log("📍 createJam() function in server.js");
    try {
        const newJam = await Jam.create(newRoom);
        const jar = await Jar.findById(jarId);
        const activeUser = await User.findById(user);

        jar.jams.push(newJam._id);
        jar.save();

        activeUser.jams.push(newJam._id);
        activeUser.save();
    } catch (err) {
        console.log(`⛔️ - The error from createJam() in server.js is: ${err}`);
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
        console.log(
            `⛔️ - The error from renameJar() from server.js is: ${err}`
        );
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
        res.status(500).send("⛔️ - Error renaming jar");
    }
});

app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = app.listen(port, function () {
    console.log(`Express app running on port ${port}`);
});

const io = require("./config/socket").init(server);

io.on("connection", (socket) => {
    console.log(`Socket.id: ${socket.id} has connected in server.js`);

    socket.on("createRoom", (newRoom, jarId, user) => {
        createJam(newRoom, jarId, user);

        io.emit("roomCreated", newRoom);
    });

    socket.on("joinRoom", (room, user) => {
        console.log(`User ${user.username} joined room ${room.socket_id}`);

        socket.join(`${room.socket_id}`);

        // ❓ There is no listener in another file currently awaiting this event emitter
        io.in(`${room.socket_id}`).emit("userJoined", room);
    });

    socket.on("renameJar", async (jarId, newJarName) => {
        console.log(
            `The new jar name is ${newJarName} and the jarId is ${jarId}`
        );

        if (!mongoose.Types.ObjectId.isValid(jarId)) {
            console.log(
                '⛔️ - socket.on("rename jar") in server.js - jarId is not a valid mongoose Object ID'
            );
        }
        try {
            const renamedJar = await renameJar(jarId, newJarName);
            io.emit(`jarRenamed/${jarId}`, renamedJar);
        } catch (err) {
            console.log(
                `⛔️ - The error from socket.on("renameJar") in server.js is: ${err}`
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

    socket.on("sendMsg", (newMsg) => {
        const returnMsg = storeMessage(newMsg);
        socket.broadcast.emit("newMsg", returnMsg);
    });

    // ❌ this listener needs to be refactored utilizing the socket_id attribute of the jam object instead of the rooms object defined in server.js - though perhaps defining a user object within this file to be updated by socket events within server.js might be the way to access the necessary room IDs that need to be left upon disconnecting. Although, a user should only be within one room at a time, so only one room should need to be left when disconnect happens
    // socket.on("disconnect", () => {
    //     console.log(`user id: ${socket.id} has disconnected`);
    //     for (const roomId in rooms) {
    //         if (rooms[roomId].users.includes(socket.id)) {
    //             rooms[roomId].users = rooms[roomId].users.filter(
    //                 (userId) => userId !== socket.id
    //             );
    //             socket.leave(`room-${roomId}`);
    //             io.in(`room-${roomId}`).emit("userLeft", {
    //                 roomId,
    //                 userId: socket.id,
    //             });
    //         }
    //     }
    // });
});
