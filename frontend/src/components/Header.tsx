const Header = ({
  className,
  title,
}: {
  className?: string;
  title: string;
}) => {
  return (
    <h1
      className={`${className} flex w-full p-6 justify-center text-2xl font-mono text-slate-100`}
    >
      {title}
    </h1>
  );
};

export { Header };
