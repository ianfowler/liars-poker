const Stepper = ({
  className,
  value,
  onChange,
  minValue,
  maxValue,
}: {
  className?: string;
  value: number;
  minValue: number;
  maxValue: number;
  onChange: (newValue: number) => void;
}) => {
  return (
    <div className={`${className} flex gap-2 select-none`}>
      <button
        className="bg-rose-700 hover:bg-rose-600 active:bg-rose-300 
                    w-6 aspect-square border border-slate-400 rounded-md
                    disabled:opacity-0"
        disabled={value === minValue}
        onClick={() => {
          if (value - 1 >= minValue) {
            onChange(value - 1);
          }
        }}
      >
        -
      </button>
      <div>{value}</div>
      <button
        className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-300 
                    w-6 aspect-square border border-slate-400 rounded-md
                    disabled:opacity-0"
        disabled={value === maxValue}
        onClick={() => {
          if (value + 1 <= maxValue) {
            onChange(value + 1);
          }
        }}
      >
        +
      </button>
    </div>
  );
};

export { Stepper };
