import { useState } from "react";
import { PlayingCard } from "./PlayingCard";

const PlayerCard = ({
  alias,
  numCards,
  active,
  className,
  hand,
  namedActions = [],
  isUser,
}: {
  alias: string;
  numCards: number;
  isUser: boolean;
  active?: boolean;
  className?: string;
  hand?: string[];
  namedActions?: string[];
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentEditedName, setCurrentEditedName] = useState(alias);

  const onNameChange = (name: string) => {
    
  }

  const onSaveName = () => {
    if (currentEditedName.length === 0) return;
    onNameChange(currentEditedName);
    setIsEditingName(false);
  };

  return (
    <div
      className={`${className} w-52 col-span-4 md:col-span-3 row-span-3 bg-slate-400
          rounded-md flex flex-col p-2 items-center 
          ${isUser ? "shadow-inner shadow-sky-50  shadow-spread-8" : ""} 
          border-slate-500 border hover:border-slate-400`}
    >
      {isUser && isEditingName ? (
        <div className="flex w-fit text-xs gap-2 py-1">
          <input
            className={`rounded-sm w-32 px-2 outline-none`}
            value={currentEditedName}
            onChange={(e) => setCurrentEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveName();
            }}
          />
          <button
            className="bg-emerald-300 text-slate-700 px-0.5 border border-slate-300 rounded-sm"
            onClick={() => onSaveName()}
          >
            save
          </button>
        </div>
      ) : (
        <div
          className={`flex justify-center text-center  ${
            active ? "bg-fuchsia-200 animate-bounce " : ""
          } ${isUser ? "hover:border" : ""} rounded-sm w-fit px-2`}
          onClick={() => setIsEditingName(true)}
        >
          {alias}
        </div>
      )}
      <div className="flex w-full gap-2 py-2 justify-center flex-wrap">
        {hand
          ? hand.map((value, index) => (
              <PlayingCard key={index} value={value} />
            ))
          : Array(numCards)
              .fill(0)
              .map((_, index) => <PlayingCard key={index} />)}
      </div>
      <ol className="text-slate-600">
        {namedActions.map((action, idx) => (
          <li key={idx}>{action}</li>
        ))}
      </ol>
    </div>
  );
};

export { PlayerCard };
