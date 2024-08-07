import { createContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";
import { Container } from "./components/Container";
import { Header } from "./components/Header";
import { PlayerCard } from "./components/PlayerCard";
import { PlayingCard } from "./components/PlayingCard";
import { GameMetaState, GamePhase } from "./types";
import { useNickname } from "./hooks/useNickname";
import { useUserId } from "./hooks/useUserId";
import _ from "underscore";
import { MoveInput } from "./components/MoveInput";
import { sioJoinGame } from "./socketActions";
import { WaitingForPlayers } from "./phases/WaitingForPlayers";

const TOP_SECRET_AUTH_TOKEN = "jiggities";
const SOCKET_URL = "http://localhost:2100";

const SocketContext = createContext<Socket>(null!);

function App() {
  const [gameMetaState, setGameMetaState] = useState<GameMetaState>();
  const { nickname: userNickname } = useNickname();
  const userId = useUserId();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      extraHeaders: { Authorization: `Bearer ${TOP_SECRET_AUTH_TOKEN}` },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      sioJoinGame({ socket, userId, userNickname });
    });

    socket.on("announce_state", (state: string) => {
      console.log(state);
      console.log(JSON.parse(state));

      setGameMetaState(GameMetaState.parse(JSON.parse(state)));
    });

    socket.on("unauthorized", (msg: string) => {
      console.error(msg);
      alert("Unauthorized connection. Please check your credentials.");
    });

    return () => {
      socket.off("message");
      socket?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current!}>
      <Container
        className="bg-slate-600"
        innerClassName="bg-slate-600 flex flex-col font-mono gap-4 pt-4 items-center"
      >
        <Header title="Liar's Poker" />
        {!gameMetaState ? (
          <div className="flex justify-center items-center flex-col gap-8 text-slate-200">
            <PlayingCard className="animate-spin-slow shadow-lg" />
            Connecting to server...
          </div>
        ) : gameMetaState.phase === GamePhase.WaitingForPlayers ? (
          <WaitingForPlayers
            gameMetaState={gameMetaState}
            className="flex flex-col gap-4 pt-4 items-center"
          />
        ) : gameMetaState.phase === GamePhase.PlayingHand ? (
          <>
            <div className="flex flex-wrap justify-center py-6 gap-4 ">
              {gameMetaState.playerIds.map((playerId, index) => (
                <PlayerCard
                  key={index}
                  numCards={3}
                  onNameChange={() => {}}
                  isUser={playerId === userId}
                  alias={gameMetaState.idToNickname[playerId]}
                />
              ))}
            </div>
            <MoveInput isPlayersTurn={false} aliasCurrentPlayer={"asdf"} />
          </>
        ) : gameMetaState.phase === GamePhase.Showdown ? (
          <></>
        ) : (
          <></>
        )}
      </Container>
    </SocketContext.Provider>
  );
}

export { SocketContext };
export default App;
