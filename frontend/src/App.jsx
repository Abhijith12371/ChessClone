import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
export default function App() {

  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen());
  const [role, setRole] = useState("spectator")

  const Drop = (data) => {
    const source = data.sourceSquare
    const target = data.targetSquare
    if ((game.turn() === "w" && role !== "white") ||
      (game.turn() === "b" && role !== "black")) {
      return false;  // ❌ not your turn
    }
    const move = game.move({
      from: source,
      to: target,
      promotion: "q"
    })
    setGame(game)
    setFen(game.fen())
    return true
  }
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

  useEffect(() => {
    socket.emit("fen", fen)
    socket.on("fenUpdated", (updatedFen) => {
      const updatedGame = new Chess(updatedFen)
      setGame(updatedGame)
      setFen(updatedGame.fen())
    })
    socket.on("playerRole", (assignedRole) => {
      setRole(assignedRole)
    })
  }, [fen])
  return (

    <div className="w-[400px] h-[400px] mx-auto my-5 border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <Chessboard options={chessboardConfig} />
    </div>
  );
}