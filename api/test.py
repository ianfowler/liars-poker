from player import Player
from api.legacy.game_round import GameRound

term_p1, term_p2 = Player("p1"), Player("p2")
game = GameRound(
    num_starting_cards=[2, 8],
    players=[term_p1, term_p2],
    num_wilds=4
)
game.play(verbose=True)
