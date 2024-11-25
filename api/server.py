import json
from typing import Optional
from flask import Flask, request
import concurrent.futures
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dataclasses import dataclass, asdict
from common import GameState
from enum import Enum

TOP_SECRET_AUTH_TOKEN = "jiggities"

DEFAULT_INIT_CARDS = 3
DEFAULT_NUM_WILDS = 4

# Websocket Events
CONNECT = "connect"
DISCONNECT = "DISCONNECT"
CLIENT_READY = "CLIENT_READY"
ESTABLISH_SID = "ESTABLISH_SID"
NOTIFY_GAME_STATE = "NOTIFY_GAME_STATE"
ANNOUNCEMENT = "ANNOUNCEMENT"
JOIN_GAME = "JOIN_GAME"
START_GAME = "START_GAME"
SET_NICKNAME = "SET_NICKNAME"


HOST = "localhost"
PORT = 2100


def socket_uid() -> str:
    """Get user ID without typechecking issues"""
    return request.sid


class GamePhases(Enum):
    WAITING_FOR_PLAYERS = "waiting"
    PLAYING_HAND = "hand"
    SHOWDOWN = "showdown"


@dataclass
class GameMetaState:
    phase: str
    game_state: Optional[GameState]
    player_ids: list[int]
    id_to_nickname: dict[str, str]
    num_init_cards: int
    num_wilds: int

    def to_dict(self):
        return asdict(self)


class LPServer:
    def __init__(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'six-piece McJiggities'
        CORS(self.app, resources={
             r"/*": {"origins": ["http://localhost:3000"]}})
        self.sio = SocketIO(self.app, cors_allowed_origins=[
                            "http://localhost:3000"], allow_headers=["Authorization"])

        self.game_meta_state = GameMetaState(
            phase=GamePhases.WAITING_FOR_PLAYERS.value,
            game_state=None,
            player_ids=[],
            id_to_nickname={},
            num_init_cards=DEFAULT_INIT_CARDS,
            num_wilds=DEFAULT_NUM_WILDS
        )

        self.socket_uid_to_uuid = {}

        self.game_round = None

        self.register_routes()
        self.register_socketio_events()

    def register_routes(self):
        """Web page routs (Could do REST stuff)"""
        @self.app.route('/')
        def hello_world():
            return 'This is a pretty cool homepage huh '

    def register_socketio_events(self):

        def announce_state():
            emit("announce_state", json.dumps(
                self.game_meta_state.to_dict()), json=True, broadcast=True)

        """Websocket events"""
        @self.sio.on('connect')
        def handle_connect():
            secret_key = request.headers.get('Authorization')
            if not secret_key or secret_key != f'Bearer {TOP_SECRET_AUTH_TOKEN}':
                print("Unauthorized user attempted connection.")
                return
            announce_state()

        @self.sio.on('disconnect')
        def handle_disconnect():
            if socket_uid() not in self.socket_uid_to_uuid or \
                    self.game_meta_state.phase != GamePhases.WAITING_FOR_PLAYERS.value:
                return
            user_id = self.socket_uid_to_uuid[socket_uid()]
            self.game_meta_state.player_ids.remove(user_id)
            del self.game_meta_state.id_to_nickname[user_id]
            announce_state()

        @self.sio.on(JOIN_GAME)
        def join_game(user_id, user_nickname):
            if self.game_meta_state.phase != GamePhases.WAITING_FOR_PLAYERS.value:
                return
            self.socket_uid_to_uuid[socket_uid()] = user_id
            if user_id not in self.game_meta_state.player_ids:
                self.game_meta_state.player_ids.append(user_id)
            self.game_meta_state.id_to_nickname[user_id] = user_nickname
            announce_state()

        @self.sio.on(SET_NICKNAME)
        def set_nickname(user_id, user_nickname):
            print(f"New nickname {user_nickname}")
            self.socket_uid_to_uuid[socket_uid()] = user_id
            self.game_meta_state.id_to_nickname[user_id] = user_nickname
            announce_state()

        @self.sio.on("CHANGE_NUM_CARDS")
        def change_num_cards(num_cards: int):
            print(f"Change num cards to {num_cards}")
            if self.game_meta_state.phase != GamePhases.WAITING_FOR_PLAYERS.value:
                return
            self.game_meta_state.num_init_cards = num_cards
            announce_state()

        @self.sio.on("CHANGE_NUM_WILDS")
        def change_num_cards(num_wilds: int):
            if self.game_meta_state.phase != GamePhases.WAITING_FOR_PLAYERS.value:
                return
            self.game_meta_state.num_wilds = num_wilds
            announce_state()

        @self.sio.on("START_GAME")
        def start_game():
            print("Start game...")
            if self.game_meta_state.phase != GamePhases.WAITING_FOR_PLAYERS.value:
                return
            self.game_meta_state.phase = GamePhases.PLAYING_HAND.value
            self.game_meta_state.game_state = GameState(
                num_starting_cards=self.game_meta_state.num_init_cards,
                num_wilds=self.game_meta_state.num_wilds,
                player_ids=self.game_meta_state.player_ids
            )
            print(self.game_meta_state.game_state)
            announce_state()

        @self.sio.on("MAKE_MOVE")
        def make_move(user_id, move_str):
            if self.game_meta_state.phase != GamePhases.PLAYING_HAND.value:
                return
            num_actions = len(
                self.game_meta_state.game_state.named_hand_actions)

            self.game_meta_state.game_state.player_ids
            pass

    def run(self):
        """Start up the server"""
        self.sio.run(self.app, debug=True, host=HOST,
                     port=PORT, use_reloader=False, log_output=False)


if __name__ == '__main__':
    with concurrent.futures.ProcessPoolExecutor() as executor:
        server = LPServer()
        server.run()
