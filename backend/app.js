const { Server } = require("socket.io")
const { createServer } = require("http")
const express = require("express")
const cors = require("cors")
const { Chess } = require("chess.js")

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const players = {}

app.use(cors())
app.get("/", (req, res) => {
    res.send("Hello this is frontend")
})

io.on("connection", (socket) => {
    // Assign role
    if (!players.white) {
        players.white = socket.id
    } else if (!players.black) {
        players.black = socket.id
    }

    // Send role to the connecting client
    if (players.white === socket.id) {
        socket.emit("playerRole", "white")
    } else if (players.black === socket.id) {
        socket.emit("playerRole", "black")
    } else {
        socket.emit("playerRole", "spectator")
    }

    console.log("connected ✅", players)

    // Listen for moves
    socket.on("fen", (data) => {
        socket.broadcast.emit("fenUpdated", data)
    })

    // Cleanup on disconnect
    socket.on("disconnect", () => {
        console.log("disconnected ❌", socket.id)
        if (players.white === socket.id) {
            delete players.white
        } else if (players.black === socket.id) {
            delete players.black
        }

        console.log("Players after disconnect:", players)
        // optional: broadcast new roles to all clients
        io.emit("playerRoleUpdate", players)
    })
})

server.listen(3000, () => {
    console.log("Server running on port 3000")
})
