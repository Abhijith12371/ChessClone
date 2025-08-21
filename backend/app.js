const { Server } = require("socket.io")
const { createServer } = require("http")
const express = require("express")
const cors = require("cors")
const { Chess } = require("chess.js")

// const chess=new Chess()
const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const gameState= {
    fen:new Chess().fen(),
    players:{
        white:null,
        black:null
    }
}

app.use(cors())
app.get("/", (req, res) => {
    res.send("Hello this is frontend")
})

io.on("connection", (socket) => {
    // Assign role
    if (!gameState.players.white) {
        gameState.players.white = socket.id
    } else if (!gameState.players.black) {
        gameState.players.black = socket.id
    }

    // Send role to the connecting client
    if (gameState.players.white === socket.id) {
        socket.emit("playerRole", "white")
    } else if (gameState.players.black === socket.id) {
        socket.emit("playerRole", "black")
    } 

    console.log("connected ✅", gameState.players)

    io.emit("players",gameState.players)

    // Listen for moves
    socket.on("state", (data) => {
        const chess=new Chess()
        gameState.fen=chess.fen()
        socket.broadcast.emit("gameState", gameState)
    })
    socket.on("move",(data)=>{
        gameState.fen=data
        socket.broadcast.emit('moveMade',gameState.fen)
    })
    // Cleanup on disconnect
    socket.on("disconnect", () => {
        console.log("disconnected ❌", socket.id)
        if (gameState.players.white === socket.id) {
            delete gameState.players.white
        } else if (gameState.players.black === socket.id) {
            delete gameState.players.black
        }

        console.log("gameState.Players after disconnect:", gameState.players)
        // optional: broadcast new roles to all clients
        io.emit("playerRoleUpdate", gameState.players)
    })
})

server.listen(3000, () => {
    console.log("Server running on port 3000")
})
