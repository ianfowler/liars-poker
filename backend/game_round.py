from collections import Counter
from typing import List
from common import *
import numpy as np
from player import Player


class GameRound:
    def __init__(self,
                 num_starting_cards: List[int],
                 players: List[Player],
                 num_wilds: int):
        self.num_starting_cards = num_starting_cards
        self.players = players
        self.num_wilds = num_wilds
        self.player_ids = [p.get_id() for p in players]
        self.named_hand_actions: List[NamedHand] = []

    def get_game_state(self) -> GameState:
        return GameState(num_starting_cards=self.num_starting_cards,
                         num_wilds=self.num_wilds,
                         player_ids=self.player_ids,
                         named_hand_actions=[*map(str, self.named_hand_actions)])

    def play(self, verbose=False):
        self.dealt_cards = self._deal_hand()
        player_idx = 0
        game_is_ongoing = True
        while game_is_ongoing:
            current_player = self.players[player_idx]
            next_action = current_player.make_turn(self.get_game_state())
            if isinstance(next_action, NamedHand):
                self.named_hand_actions.append(next_action)
                player_idx = (player_idx + 1) % len(self.players)
            else:
                self._handle_challenge(
                    player_idx=player_idx,
                    challenge_action=next_action,
                    verbose=verbose)
                game_is_ongoing = False

    def _handle_challenge(self,
                          player_idx: int,
                          challenge_action: TerminalAction,
                          verbose: bool):
        self.terminal_action = challenge_action
        last_player_idx = (player_idx - 1) % len(self.players)
        check_fn = self._call_is_correct \
            if challenge_action == CALL else self._best_is_correct
        challenge_is_correct = check_fn(self.named_hand_actions[-1])
        print("Challenge is correct", challenge_is_correct)
        print("challenge is call", challenge_action == CALL, challenge_action)
        loser_idx = last_player_idx if challenge_is_correct else player_idx
        losing_player_id = self.player_ids[loser_idx]

        if verbose:
            print(f"{challenge_action}: {losing_player_id} loses!")
            print(f"Cards: {dict(self.dealt_cards)}")

        for player in self.players:
            player.alert_outcome(last_state=self.get_game_state(),
                                 terminal_action=challenge_action,
                                 losing_player_idx=loser_idx)

    def _deal_hand(self):
        deck = np.array(RANKED_CARDS * 4 + [WILD_CARD] * self.num_wilds)
        np.random.shuffle(deck)
        next_card_index = 0
        dealt_cards = Counter(deck[:sum(self.num_starting_cards)])
        for player, num_cards in zip(self.players, self.num_starting_cards):
            player_hand = deck[next_card_index: next_card_index + num_cards]
            next_card_index += num_cards
            player.receive_hand(player_hand)
        return dealt_cards

    def _call_is_correct(self, last_hand: NamedHand) -> bool:
        return last_hand.quantity > self.dealt_cards[last_hand.card] \
            + self.dealt_cards[WILD_CARD]

    def _best_is_correct(self, last_hand: NamedHand) -> bool:
        num_wilds = self.dealt_cards[WILD_CARD]
        spot = max(NamedHand(card=card, quantity=quantity + num_wilds)
                   for card, quantity in self.dealt_cards.items()
                   if card != WILD_CARD)
        return last_hand == spot

    def __str__(self) -> str:
        return ", ".join((str(h) for h in self.named_hand_actions)) \
            + (self.terminal_action if self.terminal_action else "")
