from typing import Optional, Iterator
from flask import Flask, request
import concurrent.futures
from flask_socketio import SocketIO, emit, disconnect
import flaskapp.app_constants as cc
import flaskapp.game_util as util
import threading
from collections import deque
from dataclasses import dataclass, field
from round_robin import OptimizedRoundRobin


def user_id() -> str:
    """Get user ID without typechecking issues"""
    return request.sid  # type: ignore


@dataclass
class GraphAttributes:
    num_nodes: Optional[int] = None
    graph_dict: Optional[dict[str, list[str]]] = None
    num_picks: Optional[int] = None
    ranked_nodes: Optional[list[int]] = None
    benchmark: Optional[tuple[int, ...]] = None  # Current best strategy


@dataclass
class JobState:
    job_generator: Optional[Iterator[dict[str, int]]] = None
    job_queue: deque = field(default_factory=deque)
    active_jobs: dict[str, dict[str, int]] = field(
        default_factory=dict)  # sid -> job
    output_dir: Optional[str] = None


class PandaServer:
    def __init__(self, executor: concurrent.futures.ProcessPoolExecutor):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'secret!'
        self.sio = SocketIO(self.app)
        self.nicknames = {}  # sid -> nickname

        self.register_routes()
        self.register_socketio_events()

        self.g = GraphAttributes()
        self.jobs = JobState(output_dir=util.gen_output_dir())
        self.round_robin: Optional[OptimizedRoundRobin] = None
        self.executor = executor

    def restart(self):
        """reset the graph & jobs to clean slate"""
        self.g = GraphAttributes()
        self.jobs = JobState(output_dir=util.gen_output_dir())
        if self.round_robin:
            self.round_robin.shut_down()

    def handle_new_benchmark_strategy(self, new_benchmark: tuple[int, ...]):
        """Update the benchmark currently being used"""
        if self.g.benchmark != new_benchmark:
            print("NEW BENCHMARK, ", new_benchmark)
        self.g.benchmark = new_benchmark
        if self.jobs.output_dir and self.round_robin:
            util.save_strategies(self.jobs.output_dir,
                                 [self.round_robin.get_best_strategy()])
        else:
            print("ERROR: NO OUTPUT DIR OR SIMULATOR")

    def start_game(self, graph_dict: dict[str, list[str]], num_picks: int):
        self.g.graph_dict, self.g.num_picks = graph_dict, num_picks
        self.g.ranked_nodes = util.rank_nodes(self.g.graph_dict)
        self.g.num_nodes = len(self.g.ranked_nodes)
        if self.g.ranked_nodes and self.jobs.output_dir:
            self.g.benchmark = tuple(self.g.ranked_nodes[:self.g.num_picks])
            util.save_strategies(self.jobs.output_dir, [self.g.benchmark])
        self.sio.emit(cc.GET_GRAPH, (self.g.graph_dict,
                      self.g.num_picks, self.g.ranked_nodes))

        self.jobs.job_generator = util.generate_jobs(
            self.g.num_nodes, self.g.num_picks)
        self.round_robin = OptimizedRoundRobin(
            executor=self.executor,
            graph_dict=graph_dict,
            num_graph_nodes=self.g.num_nodes,
            new_benchmark_callback=self.handle_new_benchmark_strategy
        )

    def register_routes(self):
        """Web page routs (Could do REST stuff)"""
        @self.app.route('/')
        def hello_world():
            return 'Hey! What are you looking at?'

    def register_socketio_events(self):
        """Websocket events"""
        @self.sio.on(cc.CONNECT)
        def handle_connect():
            secret_key = request.headers.get('Authorization')
            if not secret_key or secret_key != f'Bearer {cc.TOP_SECRET_SHIT}':
                emit(cc.DISCONNECT, 'Unauthorized')
                print("Unauthorized user attempted connection.")
                disconnect(user_id())  # type: ignore
            print(f'Client connected: {user_id()}')  # type: ignore

        @self.sio.on(cc.CLIENT_READY)
        def handle_client_ready():
            emit(cc.ESTABLISH_SID, user_id())
            if self.g.graph_dict:
                emit(cc.GET_GRAPH, (self.g.graph_dict, self.g.num_picks,
                     self.g.ranked_nodes))
            else:
                emit(cc.ANNOUNCEMENT, "Still waiting on graph...")

        @self.sio.on(cc.DISCONNECT)
        def handle_disconnect():
            nickname = self.nicknames.get(user_id(), "Unknown user")
            print(f'{nickname} ({user_id()}) disconnected')
            self.nicknames.pop(user_id(), None)

            abandoned_job = self.jobs.active_jobs.get(user_id(), None)
            if abandoned_job is not None:
                self.jobs.job_queue.append(abandoned_job)
                if user_id() in self.jobs.active_jobs:
                    del self.jobs.active_jobs[user_id()]

        @self.sio.on(cc.NICKNAME_CHOICE)
        def handle_nickname(nickname):
            self.nicknames[user_id()] = nickname
            print(f'Nickname received from {user_id()}: {nickname}')

        @self.sio.on(cc.CHAT_MESSAGE)
        def handle_message(message):
            nickname = self.nicknames.get(user_id(), "Anonymous")
            broadcast_message = f'{nickname}: {message}'
            print(f'Message from {nickname} ({user_id()}): {message}')
            emit(cc.CHAT_MESSAGE, (user_id(), broadcast_message), broadcast=True)

        @self.sio.on(cc.REQUEST_WORK)
        def handle_work_request():
            print(f"{self.nicknames[user_id()]} requested work!")
            if not self.jobs.job_queue and self.jobs.job_generator:
                self.jobs.job_queue.append(
                    next(self.jobs.job_generator))
            job = self.jobs.job_queue.popleft()
            self.jobs.active_jobs[user_id()] = job
            emit(cc.ASSIGN_WORK, (job, self.g.benchmark))

        @self.sio.on(cc.COMPLETE_WORK)
        def handle_work_complete(new_strategies: list[tuple[int, ...]]):
            del self.jobs.active_jobs[user_id()]
            nickname = self.nicknames.get(user_id(), "Anonymous")
            if len(new_strategies) > 0:
                self.sio.emit(cc.ANNOUNCEMENT,
                              f"{nickname} found {len(new_strategies)} new strategies!")
                if self.round_robin:
                    self.round_robin.introduce_strategies(new_strategies)

    def handle_live_interaction(self):
        while True:
            file_read_successful = False
            while not file_read_successful:
                file_path = input("")
                try:
                    self.start_game(*util.read_graph(file_path))
                    message = f"Read file {file_path}. We pick {
                        self.g.num_picks} from {self.g.num_nodes} nodes."
                    self.sio.emit(cc.ANNOUNCEMENT, message)
                    file_read_successful = True
                except Exception as e:
                    print("Error reading file: ", e)

            # Require the user to type ABORT twice in order to quit
            num_times_aborted = 0
            while num_times_aborted < 2:
                message = input("")
                if message == cc.ABORT_KEYWORD:
                    num_times_aborted += 1

            self.sio.emit(cc.ANNOUNCEMENT,
                          "Aborting processing of current graph.")
            self.sio.emit(cc.ABORT)
            self.restart()

    def run(self):
        """Start up the server"""
        file_thread = threading.Thread(
            target=self.handle_live_interaction, daemon=True)
        file_thread.start()
        self.sio.run(self.app, debug=True, host=cc.SERVER_IP,
                     port=cc.SERVER_PORT, use_reloader=False, log_output=False)


if __name__ == '__main__':
    with concurrent.futures.ProcessPoolExecutor() as executor:
        server = PandaServer(executor=executor)
        server.run()
