import { useState } from "react";
import { ResponseType, interpretInput } from "../parser";

const MoveInput = ({
  className,
  isUsersTurn,
  currentPlayerAlias,
}: {
  className?: string;
  isUsersTurn: boolean;
  currentPlayerAlias: string;
}) => {
  const [currentInput, setCurrentInput] = useState<string>("");

  const [parserResponseType, parserMessage] = interpretInput(
    currentInput,
    true
  );

  const hasProperInput = [
    ResponseType.Hand,
    ResponseType.Call,
    ResponseType.Best,
  ].includes(parserResponseType);

  return (
    <div className={`${className} bg-slate-500 rounded-xl p-4 max-w-96`}>
      <label
        className={`block text-sm font-medium leading-6 ${
          isUsersTurn ? "text-slate-50 animate-pulse" : "text-slate-300"
        }`}
      >
        {isUsersTurn ? "Your turn!" : `Waiting for ${currentPlayerAlias}...`}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">&gt;</span>
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 
                     ring-inset ring-slate-300 placeholder:text-gray-400 focus:ring-2 outline-none
                     focus:ring-inset focus:ring-slate-400 sm:text-sm sm:leading-6"
          placeholder={isUsersTurn ? "four aces" : ""}
          onChange={(e) => setCurrentInput(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label className="sr-only">Currency</label>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center ">
          <button
            className={`text-gray-500 sm:text-sm ${
              hasProperInput && isUsersTurn ? "bg-fuchsia-300" : ""
            }  p-1 px-2 mr-1 rounded-md`}
            disabled={!isUsersTurn}
          >
            enter
          </button>
        </div>
      </div>
      <label className="text-slate-400 text-xs">
        {currentInput ? parserMessage : ""}
      </label>
    </div>
  );
};

export { MoveInput };
