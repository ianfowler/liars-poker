import pytest
from api.common import NamedHand


@pytest.mark.parametrize("named_hand, n, expected_hand", [
    (NamedHand("A", 3, num_nonwild_ranks=12), 0,
     NamedHand("A", 3, num_nonwild_ranks=12)),
    (NamedHand("A", 3, num_nonwild_ranks=12), 1,
     NamedHand("3", 4, num_nonwild_ranks=12)),
    (NamedHand("A", 3, num_nonwild_ranks=12), 2,
     NamedHand("4", 4, num_nonwild_ranks=12)),
    (NamedHand("A", 3, num_nonwild_ranks=12), 12,
     NamedHand("A", 4, num_nonwild_ranks=12)),
    (NamedHand("3", 1, num_nonwild_ranks=3), 8,
     NamedHand("5", 3, num_nonwild_ranks=3)),
])
def test_advance(named_hand, n, expected_hand):
    assert named_hand.advance_rank(n) == expected_hand
