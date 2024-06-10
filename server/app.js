import express from "express";
import { config } from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "dsaadsdassaddasdasdas";
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

app.get("/login", (req,res) => {
  const token = jwt.sign({ _id:"asdsadsadasdsadsaads"} , secretKeyJWT);

  res
  .cookie("token", token , {httpOnly:false , secure: true , sameSite: "none" })
  .json({
    message: "Login Success"
  })
})

const user = false;

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) {
            return next(err);
        }

        const token = socket.request.cookies.token;

        if (!token) {
            return next(new Error("Authentication Error: Token not found"));
        }

        jwt.verify(token, secretKeyJWT, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication Error: Invalid token"));
            }

            socket.request.user = decoded; // Attach decoded token to the request for further use
            next();
        });
    });
});


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




