import express from 'express'
import http from 'http'
import {Server} from 'socket.io'


const app = express();
const server = http.createServer(app)


// Initialize socket io
const io = new Server(server, {
    cors:{
        origin:"*", // will add fronted url later
        methods:["GET", "POST"]
    }
});

global.io = io; // store io globally so controller can access it

// Handling connections
io.on("connection", (socket) => {
    console.log("User connected: ", socket.id )

    socket.on("join", (userId) => {
        console.log(`User ${userId} joined`);
        socket.join(userId)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id)
    })
})

export default server
