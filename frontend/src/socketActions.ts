import { Socket } from "socket.io-client";

const sioJoinGame = ({
  socket,
  userId,
  userNickname,
}: {
  socket: Socket;
  userId: string;
  userNickname: string;
}) => {
  socket.emit("JOIN_GAME", userId, userNickname);
};

const sioChangeNumCards = ({
  socket,
  numCards,
}: {
  socket: Socket;
  numCards: number;
}) => {
  socket.emit("CHANGE_NUM_CARDS", numCards);
};

const sioChangeNumWilds = ({
  socket,
  numWilds,
}: {
  socket: Socket;
  numWilds: number;
}) => {
  socket.emit("CHANGE_NUM_WILDS", numWilds);
};

const sioSetNickname = ({
  socket,
  userId,
  name,
}: {
  socket: Socket;
  userId: string;
  name: string;
}) => {
  socket.emit("SET_NICKNAME", userId, name);
};

const sioStartGame = ({ socket }: { socket: Socket }) => {
  socket.emit("START_GAME");
};

export {
  sioJoinGame,
  sioChangeNumCards,
  sioChangeNumWilds,
  sioSetNickname,
  sioStartGame,
};
