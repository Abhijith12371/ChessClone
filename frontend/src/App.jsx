import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
export default function App() {

  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen());
  const [role, setRole] = useState("")
  const [players, setPlayers] = useState()



  //piece move funion
  const Drop = (data) => {
    const source = data.sourceSquare
    const target = data.targetSquare
    if ((game.turn() === "w" && role !== "white") ||
      (game.turn() === "b" && role !== "black")) {
      return false;
    }
    game.move({
      from: source,
      to: target,
      promotion: "q"
    })
    const newFen = game.fen()
    setGame(new Chess(newFen))
    setFen(newFen)
    socket.emit("move", newFen)
    return true
  }

  // chessBoardOptions
  const chessboardConfig = {
    position: fen,
    boardOrientation: role === "black" ? "black" : "white",
    boardWidth: 400,
    onPieceDrop: Drop,
    customBoardStyle: {
      borderRadius: "8px",
    },
    customDarkSquareStyle: { backgroundColor: "#769656" },
    customLightSquareStyle: { backgroundColor: "#eeeed2" }
  };


  // boardUpdateonEachSocketRender
  useEffect(() => {
    socket.on("state", (gameState) => {
      const updatedGame = new Chess(gameState.fen)
      setGame(updatedGame)
      setFen(updatedGame.fen())
    })
    socket.on("moveMade", (updatedmove) => {
      const updatedGame = new Chess(updatedmove)
      setGame(updatedGame)
      setFen(updatedGame.fen())
    })
    socket.on("playerRole", (assignedRole) => {
      setRole(assignedRole)
    })


    return () => {
      socket.off("state");
      socket.off("moveMade");
      socket.off("playerRole");
    };
  }, [socket])

  useEffect(() => {
    socket.on("players", (data) => {
      console.log(data)
      setPlayers(data)
    })
  }, [players,socket])
  return (

    <div className="w-[400px] h-[400px] mx-auto my-5 border border-gray-300 rounded-lg overflow-hidden shadow-md">
      {players?.white && players?.black ?
        <Chessboard options={chessboardConfig} /> : "searchinng"}
    </div>
  )
}