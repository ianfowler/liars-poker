import { useContext } from "react";
import { Stepper } from "../components/Stepper";
import { GameMetaState } from "../types";
import {
  sioChangeNumCards,
  sioChangeNumWilds,
  sioSetNickname,
  sioStartGame,
} from "../socketActions";
import { PlayingCard } from "../components/PlayingCard";
import { PlayerCard } from "../components/PlayerCard";
import { useNickname } from "../hooks/useNickname";
import { useUserId } from "../hooks/useUserId";

const WaitingForPlayers = ({
  className,
  gameMetaState,
}: {
  gameMetaState: GameMetaState;
  className?: string;
}) => {
  const { setNickname } = useNickname();
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

  return (
    <div className={`${className}`}>
      <div className="text-slate-200 flex gap-16">
        <div className="flex flex-col gap-4 items-center w-52">
          <div>Cards per player</div>
          <Stepper
            value={gameMetaState.numInitCards}
            minValue={1}
            maxValue={10}
            onChange={(numCards: number) => {
              console.log(`Changed to ${numCards} cards`)
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
            onChange={(numWilds: number) => {
              console.log(`num wilds changed to ${numWilds}`);
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
          console.log("Should start game")
        }}
      >
        Start Game
      </button>
    </div>
  );
};

export { WaitingForPlayers };
