from abc import ABC
from common import *
from typing import List, Optional, Callable


class Player(ABC):
    def __init__(self, id: str):
        self.hand: List[Card] = []
        self.id = id

    def receive_hand(self, hand: List[Card]):
        """
        The game class notifies player of the hand they are dealt.
        """
        self.hand = hand

    def make_turn(self, game_state: GameState, alert_turn: Callable[[], Action]):

        pass

    def get_id(self) -> str:
        return self.id

    def alert_outcome(self,
                      last_state: GameState,
                      terminal_action: TerminalAction,
                      losing_player_idx: int):
        pass


class TerminalPlayer(Player):

    def __init__(self, id: str):
        super().__init__(id)

    def receive_hand(self, hand: List[Card]):
        """
        The game class notifies player of the hand they are dealt. 
        """
        self.hand = sorted(hand)
        print(f"{self.id} hand: {self.hand}")

    def _print_game_state(self, game_state: GameState):
        total_cards = sum(game_state.num_starting_cards)
        print("Game State " +
              f"({total_cards} dealt cards, {game_state.num_wilds} wilds)")
        num_players = len(game_state.player_ids)
        for i, action in enumerate(game_state.named_hand_actions):
            player_idx = i % num_players
            id = game_state.player_ids[player_idx]
            num_cards = game_state.num_starting_cards[player_idx]
            print(f"{id} [{num_cards}]: {action}")

    def _prompt_turn(self, last_hand: Optional[NamedHand]) -> Action:
        ex_hands = f", {CALL}, {BEST}" if last_hand else ""
        move_str = input(f"{self.id} move (e.g. 4 A{ex_hands}): ")
        move_str = move_str.upper().strip()
        if move_str in [CALL.upper(), BEST.upper()]:
            if last_hand is None:
                print("Please start the game by naming a hand.")
                return self._prompt_turn(last_hand)
            return CALL if move_str == CALL.upper() else BEST
        split_move_str = move_str.replace("X", " ").split(" ")
        if len(split_move_str) != 2:
            print("Include quantity and card by a space.")
            return self._prompt_turn(last_hand)
        qty, card = split_move_str
        if not qty.isnumeric():
            print("Please input a numeric card quantity.")
            return self._prompt_turn(last_hand)
        qty_num = int(qty)
        if qty_num <= 0:
            print("Please enter a positive card quantity.")
            return self._prompt_turn(last_hand)
        card = card.replace("10", "T")
        if card not in RANKED_CARDS:
            print(f"Please enter a valid card. Options: {RANKED_CARDS}")
            return self._prompt_turn(last_hand)
        named_hand = NamedHand(card, qty_num)  # TODO: make linter ignore this
        if last_hand and named_hand <= last_hand:
            print("If naming a hand, " +
                  f"please name a hand better than {last_hand}")
            return self._prompt_turn(last_hand)
        return named_hand

    def make_turn(self, game_state: GameState) -> Action:
        self._print_game_state(game_state)
        print(f"{self.id} hand: {self.hand}")
        return self._prompt_turn(
            last_hand=game_state.named_hand_actions[-1]
            if game_state.named_hand_actions else None
        )

    def get_id(self) -> str:
        return self.id

    def alert_outcome(self,
                      last_state: GameState,
                      terminal_action: TerminalAction,
                      losing_player_idx: int):
        self._print_game_state(last_state)
        print(f"Last action: {terminal_action}")
        loser = last_state.player_ides[losing_player_idx]
        print(f"Outcome: {loser} loses!")


class WebClientPlayer(Player):

    def __init__(self, id: str, on_make_turn: Callable[[], str]):
        super().__init__(id)
        self.on_make_turn = on_make_turn

    def receive_hand(self, hand: List[Card]):
        """
        The game class notifies player of the hand they are dealt. 
        """
        self.hand = sorted(hand)
        print(f"{self.id} hand: {self.hand}")

    def make_turn(self, game_state: GameState) -> Action:
        # Wait for on_make_turn to be called....
        # Return output of on_make_turn
        self._print_game_state(game_state)
        print(f"{self.id} hand: {self.hand}")
        return self._prompt_turn(
            last_hand=game_state.named_hand_actions[-1]
            if game_state.named_hand_actions else None
        )

    def get_id(self) -> str:
        return self.id

    def alert_outcome(self,
                      last_state: GameState,
                      terminal_action: TerminalAction,
                      losing_player_idx: int):
        self._print_game_state(last_state)
        print(f"Last action: {terminal_action}")
        loser = last_state.player_ides[losing_player_idx]
        print(f"Outcome: {loser} loses!")
