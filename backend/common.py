from dataclasses import dataclass, field
from typing import List, Union, Literal
from functools import total_ordering

Card = Literal["W", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]

RANKED_CARDS: List[Card] = ["3", "4", "5", "6", "7", "8", "9", "T", "J", "Q",
                            "K", "A"]

WILD_CARD: Card = "W"


@total_ordering
class NamedHand:
    def __init__(self,
                 card: Card,
                 quantity: int,
                 num_nonwild_ranks: int):
        assert card in RANKED_CARDS, "Card must be a ranked card."
        assert quantity > 0, "Quantity must be positive."
        assert num_nonwild_ranks <= len(RANKED_CARDS), "That's a lot of cards!"
        assert RANKED_CARDS.index(
            card) < num_nonwild_ranks, "Card outside range."
        self.num_nonwild_ranks = num_nonwild_ranks
        self.card = card
        self.quantity = quantity

    @property
    def rank(self) -> int:
        return self.num_nonwild_ranks * (self.quantity - 1) + \
            RANKED_CARDS.index(self.card) + 1

    def advance_rank(self, n: int) -> 'NamedHand':
        assert n >= 0, "Rank must be advance by a nonnegative nubmer of steps."
        rank = self.rank + n
        quantity = (rank - 1) // self.num_nonwild_ranks + 1
        card_index = (rank - 1) % self.num_nonwild_ranks
        card = RANKED_CARDS[card_index]
        return NamedHand(card, quantity, self.num_nonwild_ranks)

    def __eq__(self, other: object) -> bool:
        assert self.num_nonwild_ranks == other.num_nonwild_ranks, "Must compare same deck"
        if not isinstance(other, NamedHand):
            raise NotImplemented
        return self.rank == other.rank

    def __lt__(self, other: object) -> bool:
        assert self.num_nonwild_ranks == other.num_nonwild_ranks, "Must compare same deck"
        if not isinstance(other, NamedHand):
            raise NotImplemented
        return self.rank < other.rank

    def __str__(self) -> str:
        return f"{self.quantity},{self.card}"


TerminalAction = Literal["Call", "Best"]
CALL: TerminalAction = "Call"  # Short (and PG) for "Call Bullshit"
BEST: TerminalAction = "Best"  # "This is the best hand possible" (aka Spot)
Action = Union[NamedHand, TerminalAction]


@dataclass
class ChallengeOutcome:
    last_player_idx: int
    challenger_idx: int
    challenger_won: bool


@dataclass
class GameState:
    num_starting_cards: List[int]
    num_wilds: int
    player_ids: List[str]
    named_hand_actions: List[str] = field(default_factory=list)
    num_nonwild_ranks: int = 12
    qty_per_nonwild_rank: int = 4
    terminal_action: TerminalAction | None = None
    challenge_outcome: ChallengeOutcome | None = None

    def __post_init__(self):
        assert len(self.num_starting_cards) == len(self.player_ids), \
            f"Length of num_starting_cards({len(self.num_starting_cards)}) " + \
            f"must match length of player_ids({len(self.player_ids)})"

    def name_hand(self, card: Card, quantity: int) -> NamedHand:
        return NamedHand(
            card=card,
            quantity=quantity,
            num_nonwild_ranks=self.num_nonwild_ranks
        )


@dataclass
class PlayerInfoSet:
    game_state: GameState
    holding: List[Card]
    turn_idx: int
