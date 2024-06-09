import express from "express";
import { config } from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";


const app = express();

config({ path: "./config.env"});

const port = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server , {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET","POST"],
        credentials: true,
    }
});


app.get("/", (req,res) => {
    res.send("hello world");
})

io.on("connection" , (socket) => {
    console.log("User Connected", socket.id);

    socket.on("message" , ({ room , message }) => {
        console.log({room , message});
       socket.to(room).emit("receive-message",message);
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    })
    
    socket.on("disconnect" , () => {
        console.log("User Disconnected", socket.id)
    })
});


server.listen(port,() => {
    console.log(`Server is running on port ${port}`)
})




