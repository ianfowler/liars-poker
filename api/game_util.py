from collections import Counter
from typing import List
from common import *
import numpy as np


def deal_cards(state: GameState) -> tuple[dict[str, List[Card]], Counter]:
    """
    Given a game state,
    Returns
     - deal: the mapping from player id -> hand
             hand is like ['A', 'A', 'K'] for two aces and one king
     - communal_card_quantities: number of cards of each type (Counter)
    """
    deck = np.array(RANKED_CARDS * 4 + [WILD_CARD] * state.num_wilds)
    np.random.shuffle(deck)
    next_card_index = 0
    communal_card_quantities = Counter(deck[:sum(state.num_starting_cards)])
    deal: dict[str, List[Card]] = {}
    for player_id, num_cards in zip(state.player_ids, state.num_starting_cards):
        player_hand: List[Card] = deck[next_card_index: next_card_index + num_cards]
        deal[player_id] = player_hand
        next_card_index += num_cards
    return deal, communal_card_quantities


def handle_challenge(state: GameState, communal_cards: Counter) -> ChallengeOutcome:
    """
    Assumes the terminal action is already in the game state as the last action.
    """
    assert state.terminal_action is not None, "Game state must have terminal action"
    last_hand: NamedHand = state.named_hand_actions[-1]

    def _check_call() -> bool:
        return last_hand.quantity > communal_cards[last_hand.card] \
            + communal_cards[WILD_CARD]

    def _check_best() -> bool:
        num_wilds = communal_cards[WILD_CARD]
        spot = max(NamedHand(card=card, quantity=quantity + num_wilds)
                   for card, quantity in communal_cards.items()
                   if card != WILD_CARD)
        return last_hand == spot

    num_actions = len(state.named_hand_actions)
    num_players = len(state.player_ids)

    return ChallengeOutcome(
        last_player_idx=(num_actions - 1) % num_players,
        challenger_idx=num_actions % num_players,
        challenger_won=_check_call() if state.terminal_action == CALL else _check_best()
    )
