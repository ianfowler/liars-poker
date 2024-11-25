import { useContext } from "react";
import { GameMetaState } from "../types";
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
  const userId = useUserId();

  const gameState = gameMetaState.gameState;
  const namedHands = gameState?.namedHandActions;
  const numNamedHands = namedHands?.length || 0;
  const userIdx = gameMetaState.playerIds.indexOf(userId);
  const numPlayers = gameMetaState.playerIds.length;
  const currTurnIdx = numNamedHands % numPlayers;
  const isUsersTurn = userIdx === currTurnIdx;
  const currentPlayerAlias = gameMetaState.idToNickname[currTurnIdx];

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap justify-center py-6 gap-4 ">
        {gameMetaState.playerIds.map((playerId, index) => (
        <div key={index}>{playerId}</div>
          //<PlayerCard
          //  key={index}
          //  numCards={3}
          //  onNameChange={() => {}}
          //  isUser={playerId === userId}
          //  alias={gameMetaState.idToNickname[playerId]}
          ///>
        ))}
      </div>
      <MoveInput
        isUsersTurn={isUsersTurn}
        currentPlayerAlias={currentPlayerAlias}
      />
    </div>
  );
};

export { PlayingHand };
