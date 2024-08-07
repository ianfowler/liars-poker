import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import { Container } from "./components/Container";
import { Header } from "./components/Header";
import { PlayerCard } from "./components/PlayerCard";
import { PlayingCard } from "./components/PlayingCard";
import { Stepper } from "./components/Stepper";
import { GameMetaState, GamePhase } from "./types";
import { useNickname } from "./hooks/useNickname";
import { useUserId } from "./hooks/useUserId";
import _ from "underscore";
import { MoveInput } from "./components/MoveInput";

const TOP_SECRET_AUTH_TOKEN = "jiggities";

const socket = io("http://localhost:2100", {
  extraHeaders: { Authorization: `Bearer ${TOP_SECRET_AUTH_TOKEN}` },
});

function App() {
  const [gameMetaState, setGameMetaState] = useState<GameMetaState>();
  const { nickname: userNickname, setNickname } = useNickname();
  const userId = useUserId();

  const cardsUsed = gameMetaState
    ? gameMetaState.numInitCards * gameMetaState.playerIds.length
    : 0;

  const maxCards = 48 + (gameMetaState ? gameMetaState.numWilds : 0);

  const usingOkNumCards = cardsUsed <= maxCards;

  const canStartGame =
    gameMetaState &&
    cardsUsed <= maxCards &&
    gameMetaState.playerIds.length > 1;

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("JOIN_GAME", userId, userNickname);
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
    };
  }, []);

  return (
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
        <>
          <div className="text-slate-200 flex gap-16">
            <div className="flex flex-col gap-4 items-center w-52">
              <div>Cards per player</div>
              <Stepper
                value={gameMetaState.numInitCards}
                minValue={1}
                maxValue={10}
                onChange={(newValue: number) => {
                  socket.emit("CHANGE_NUM_CARDS", newValue);
                }}
              />
              <div className="flex flex-wrap gap-2">
                {Array(gameMetaState.numInitCards)
                  .fill(0)
                  .map((_, idx) => (
                    <PlayingCard key={idx} />
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center w-52">
              <div>Wilds in the deck</div>
              <Stepper
                value={gameMetaState.numWilds}
                minValue={0}
                maxValue={10}
                onChange={(newValue: number) => {
                  socket.emit("CHANGE_NUM_WILDS", newValue);
                }}
              />
              <div className="flex flex-wrap gap-2">
                {Array(gameMetaState.numWilds)
                  .fill(0)
                  .map((_, idx) => (
                    <PlayingCard key={idx} value="W" />
                  ))}
              </div>
            </div>
          </div>
          <div
            className={`text-sm ${
              usingOkNumCards
                ? "text-slate-200"
                : "bg-rose-400 p-2 rounded-sm border-sm"
            }`}
          >{`Using ${cardsUsed} of ${maxCards} cards in the deck.`}</div>
          <div className="flex flex-wrap justify-center py-6 gap-4 ">
            {gameMetaState.playerIds.map((playerId, index) => (
              <PlayerCard
                key={index}
                numCards={gameMetaState.numInitCards}
                onNameChange={(name) => {
                  console.log("gonna emit ", userId, name);
                  socket.emit("SET_NICKNAME", userId, name);
                  setNickname(name);
                }}
                isUser={playerId === userId}
                alias={gameMetaState.idToNickname[playerId]}
              />
            ))}
          </div>
          <button
            className="p-2 hover:bg-emerald-500 border border-slate-200
           bg-slate-500 text-slate-200 rounded-sm active:bg-emerald-400
           disabled:bg-slate-600 disabled:border-slate-400 disabled:text-slate-400"
            disabled={!canStartGame}
            onClick={() => {
              socket.emit("START_GAME");
            }}
          >
            Start Game
          </button>
        </>
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
  );
}

export default App;
