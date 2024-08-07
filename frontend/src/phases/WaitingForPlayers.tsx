import { Stepper } from "../components/Stepper";
import { GameMetaState } from "../types";

const WaitingForPlayers = ({
  className,
  gameMetaState,
}: {
  gameMetaState: GameMetaState;
  className?: string;
}) => {
  return (
    <div className={`${className}`}>
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
    </div>
  );
};
