import platform
import concurrent.futures
import threading
import socketio
import torch
from colorama import Fore, Style
import flaskapp.app_constants as cc
import flaskapp.game_util as util

IS_MAC = platform.system() == 'Darwin'


def c(color_str):
    """Hide the colors if user is not on a mac"""
    return color_str if IS_MAC else ""


class PandaClient:
    def __init__(self, executor: concurrent.futures.ProcessPoolExecutor):
        self.sio = socketio.Client(
            logger=False, ssl_verify=False)
        self.my_sid = None
        self.register_events()
        self.executor = executor
        self.graph_dict = None
        self.num_picks = None
        self.ranked_nodes = []
        self.current_work = None
        self.benchmark_strat = None
        self.mod_adj = torch.Tensor()

    def game_is_active(self):
        """Check if a game is currently being run"""
        return self.graph_dict is not None

    def register_events(self):
        """Websocket events"""
        @self.sio.event
        def connect():
            nickname = util.get_nickname()
            print(
                f"{c(Fore.RED)}Connection established! Welcome, {nickname}!{c(Style.RESET_ALL)}")
            self.sio.emit(cc.NICKNAME_CHOICE, (nickname))
            self.sio.emit(cc.CLIENT_READY)

        @self.sio.event
        def disconnect():
            print('Disconnected from server')

        @self.sio.event
        def message(sender_id: str, message_contents: str):
            if sender_id != self.my_sid:
                print(f"{c(Fore.CYAN)}{message_contents}{c(Style.RESET_ALL)}")

        @self.sio.event
        def announcement(message_contents: str):
            print(f"{c(Fore.RED)}{message_contents}{c(Style.RESET_ALL)}")

        @self.sio.event
        def get_graph(graph_dict: dict[str, list[str]], num_picks: int, ranked_nodes: list[int]):
            self.graph_dict = graph_dict
            self.num_picks = num_picks
            self.ranked_nodes = ranked_nodes
            num_nodes = len(ranked_nodes)
            self.mod_adj = util.prepare_mod_adj(num_nodes, graph_dict)
            self.sio.emit(cc.REQUEST_WORK, )
            print(f"{c(Fore.MAGENTA)}Got the graph!{c(Fore.LIGHTMAGENTA_EX)} top nodes: ",
                  f"{ranked_nodes[:min(num_nodes, 6)]} {c(Style.RESET_ALL)}")

        @self.sio.event
        def assign_work(job: dict[str, int], current_benchmark: tuple[int, ...]):
            print(f"{c(Fore.MAGENTA)}Started chugging{c(Fore.LIGHTMAGENTA_EX)}",
                  f"{job['k']}c{job['num_picks']} page",
                  f"{job['offset']//job['limit']}",
                  f"{c(Style.DIM)}using benchmark {current_benchmark}{c(Style.RESET_ALL)}")
            new_strats = list(util.combos_with_ele_k(self.ranked_nodes, **job))
            new_strategy_performances = util.compare_strategy(new_strats,
                                                              self.executor,
                                                              current_benchmark,
                                                              len(self.ranked_nodes),
                                                              self.mod_adj)
            winning_new_strategies = [strategy for strategy, win_margin
                                      in new_strategy_performances if win_margin > 0]
            self.sio.emit(cc.COMPLETE_WORK, (winning_new_strategies, ))
            num_found = len(winning_new_strategies)
            if num_found > 0:
                print(f"{c(Fore.LIGHTMAGENTA_EX)}Done! Found {len(winning_new_strategies)}",
                      f"new strategies!{c(Style.RESET_ALL)}")
            else:
                print(
                    f"{c(Fore.MAGENTA)}{c(Style.DIM)}Done! Did not find new strategies.{c(Style.RESET_ALL)}")
            # TODO: Metrics on strategies tested/second
            self.sio.emit(cc.REQUEST_WORK, )

        @self.sio.event
        def get_my_sid(sid):
            self.my_sid = sid

        @self.sio.event
        def abort():
            self.graph_dict = None
            self.num_picks = None
            self.ranked_nodes = None

    def run_chat(self):
        while True:
            chat_message = input()
            self.sio.emit('message', chat_message)

    def start(self):
        try:
            self.sio.connect(cc.SERVER_URL, headers={
                             'Authorization': f'Bearer {cc.TOP_SECRET_SHIT}'})
            chat_thread = threading.Thread(target=self.run_chat, daemon=True)
            chat_thread.start()
            self.sio.wait()
        except Exception as e:
            print(f"Connection Error: {e}")


if __name__ == '__main__':
    with concurrent.futures.ProcessPoolExecutor() as executor:
        client = PandaClient(executor=executor)
        client.start()
