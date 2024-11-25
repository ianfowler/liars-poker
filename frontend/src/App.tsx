import { createContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { Container } from "./components/Container";
import { Header } from "./components/Header";
import { PlayingCard } from "./components/PlayingCard";
import { GameMetaState, GamePhase } from "./types";
import { useNickname } from "./hooks/useNickname";
import { useUserId } from "./hooks/useUserId";
//import { WaitingForPlayers } from "./phases/WaitingForPlayers";
//import { PlayingHand } from "./phases/PlayingHand";

//{!gameMetaState ? (
//  <div className="flex justify-center items-center flex-col gap-8 text-slate-200">
//    <PlayingCard className="animate-spin-slow shadow-lg" />
//    Connecting to server...
//  </div>
//) : gameMetaState.phase === GamePhase.WaitingForPlayers ? (
//  <WaitingForPlayers
//    gameMetaState={gameMetaState}
//    className="flex flex-col gap-4 pt-4 items-center"
//  />
//) : gameMetaState.phase === GamePhase.PlayingHand ? (
//  <PlayingHand
//    gameMetaState={gameMetaState}
//    className="flex flex-col gap-4 pt-4 items-center"
//  />
//) : gameMetaState.phase === GamePhase.Showdown ? (
//  <></>
//) : (
//  <></>
//)}

const App = () => {
  const [gameMetaState, setGameMetaState] = useState<GameMetaState>();
  const { nickname: userNickname } = useNickname();
  const userId = useUserId();

  return (
    <Container
      className="bg-slate-600"
      innerClassName="bg-slate-600 flex flex-col font-mono gap-4 pt-4 items-center"
    >
      <Header title="Liar's Poker" />
        <div className="flex justify-center items-center flex-col gap-8 text-slate-200">
          <PlayingCard className="animate-spin-slow shadow-lg" />
          Connecting to server...
        </div>
    </Container>
  );
}

export { App };
