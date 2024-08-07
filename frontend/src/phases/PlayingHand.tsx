import { useContext } from "react";
import { GameMetaState } from "../types";
import { SocketContext } from "../App";
import { PlayerCard } from "../components/PlayerCard";
import { useUserId } from "../hooks/useUserId";
import { MoveInput } from "../components/MoveInput";

const PlayingHand = ({
  className,
  gameMetaState,
}: {
  gameMetaState: GameMetaState;
  className?: string;
}) => {
  const socket = useContext(SocketContext);
  const userId = useUserId();

  const namedHands = gameMetaState.gameState?.namedHandActions;

  return (
    <div className={`${className}`}>
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
    </div>
  );
};

export { PlayingHand };
