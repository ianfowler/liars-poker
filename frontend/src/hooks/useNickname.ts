import { useState } from "react";
import _ from "underscore";

const POKER_NICKNAMES = [
  "Han Darrington",
  "Brad Moben",
  "Rampaige",
  "Maryano",
  "Phil Iveyard",
  "Doyle Bunson",
  "Daniel Negreeno",
  "Johnny Chanp",
  "Chris Moneymake",
  "Phil Helmuthy",
  "Tom Dwaney",
  "Antonio Esfandiani",
  "Erik Seide",
  "Vanessa Selbtsy",
  "Jennifer Harmanigan",
  "Barry Greensteinberg",
  "Jason Koonn",
  "Fedor Holtzmann",
  "Doug Polkson",
];

const useNickname = () => {
  const [nickname, setNicknameState] = useState(() => {
    const storedNickname = localStorage.getItem("nickname");
    if (storedNickname) {
      return storedNickname;
    } else {
      const newNickname = _.sample(POKER_NICKNAMES)! + ` ${_.random(100)}`;
      localStorage.setItem("nickname", newNickname);
      return newNickname;
    }
  });

  const setNickname = (newNickname: string) => {
    setNicknameState(newNickname);
    localStorage.setItem("nickname", newNickname);
  };

  return { nickname, setNickname };
};

export { useNickname };
