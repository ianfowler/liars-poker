const PlayingCard = ({
  className,
  value,
  height = 30,
}: {
  className?: string;
  value?: string;
  height?: number;
}) => {
  const aspectRatio = 2.5 / 3.5;
  const width = height * aspectRatio;

  return (
    <div
      className={`${className} ${
        value === "W" ? "bg-amber-400" : value ? "bg-slate-50" : "bg-rose-100"
      } hite border-2 border-slate-200 rounded-sm flex items-center justify-center shadow-md`}
      style={{
        height: `${height}px`,
        width: `${width}px`,
      }}
    >
      <p className="font-sans font-black">{value}</p>
    </div>
  );
};

export { PlayingCard };
