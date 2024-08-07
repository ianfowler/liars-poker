import { z } from "zod";

enum GamePhase {
  WaitingForPlayers = "waiting",
  PlayingHand = "hand",
  Showdown = "showdown",
}

enum TerminalAction {
  Call = "Call",
  Best = "Best",
}

const ChallengeOutcome = z
  .object({
    last_player_idx: z.number(),
    challenger_idx: z.number(),
    challenger_won: z.boolean(),
  })
  .transform(({ last_player_idx, challenger_idx, challenger_won }) => ({
    lastPlayerIdx: last_player_idx,
    challengerIdx: challenger_idx,
    challengerWon: challenger_won,
  }));

const GameState = z
  .object({
    num_starting_cards: z.number(),
    num_wilds: z.number(),
    player_ids: z.array(z.string()),
    named_hand_actions: z.array(z.string()),
    terminal_action: z.nativeEnum(TerminalAction).nullable(),
    challenge_outcome: ChallengeOutcome.nullable(),
  })
  .transform(
    ({
      num_starting_cards,
      num_wilds,
      player_ids,
      named_hand_actions,
      terminal_action,
      challenge_outcome,
    }) => ({
      numStartingCards: num_starting_cards,
      numWilds: num_wilds,
      playerIds: player_ids,
      namedHandActions: named_hand_actions,
      terminalAction: terminal_action,
      challengeOutcome: challenge_outcome,
    })
  );

type GameState = z.output<typeof GameState>;

const GameMetaState = z
  .object({
    phase: z.nativeEnum(GamePhase),
    game_state: GameState.nullable(),
    player_ids: z.array(z.string()),
    id_to_nickname: z.record(z.string(), z.string()),
    num_init_cards: z.number(),
    num_wilds: z.number(),
  })
  .transform(
    ({
      phase,
      game_state,
      player_ids,
      id_to_nickname,
      num_init_cards,
      num_wilds,
    }) => ({
      phase,
      gameState: game_state,
      playerIds: player_ids,
      idToNickname: id_to_nickname,
      numInitCards: num_init_cards,
      numWilds: num_wilds,
    })
  );

type GameMetaState = z.output<typeof GameMetaState>;

export { GameState, GameMetaState, GamePhase };
