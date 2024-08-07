from dataclasses import dataclass, field
from typing import List, Union, Literal
from functools import total_ordering

Card = Literal["W", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]

RANKED_CARDS: List[Card] = ["3", "4", "5", "6", "7", "8", "9", "T", "J", "Q",
                            "K", "A"]

WILD_CARD: Card = "W"


@total_ordering
class NamedHand:
    def __init__(self, card: Card, quantity: int):
        assert card in RANKED_CARDS, "Card must be a ranked card."
        assert quantity > 0, "Quantity must be positive."
        self.card = card
        self.quantity = quantity
        self.rank = self._compute_rank()

    def _compute_rank(self) -> int:
        return len(RANKED_CARDS) * (self.quantity - 1) + \
            RANKED_CARDS.index(self.card) + 1

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, NamedHand):
            raise NotImplemented
        return self.rank == other.rank

    def __lt__(self, other: object) -> bool:
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
    terminal_action: TerminalAction | None = None
    challenge_outcome: ChallengeOutcome | None = None
