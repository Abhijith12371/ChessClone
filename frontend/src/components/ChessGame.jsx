import { Chessboard } from "react-chessboard";

export default function ChessGame() {
  // London System FEN after 1.d4 d5 2.Nf3 Nf6 3.Bf4
  const fen = "rnbqkb1r/pppppppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 2 3";

  return (
    <div className="w-[400px] h-[400px] mx-auto my-5 border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <Chessboard 
        position={fen}
        boardOrientation="white"
        boardWidth={400}
        customBoardStyle={{
          borderRadius: "8px",
        }}
        customDarkSquareStyle={{ backgroundColor: "#769656" }}
        customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
      />
    </div>
  );
}