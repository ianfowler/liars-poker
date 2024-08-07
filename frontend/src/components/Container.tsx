import { ReactNode } from "react";

const Container = ({
  className,
  innerClassName,
  children,
}: {
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`${className} flex justify-center items-start min-h-screen`}
    >
      <div
        className={`${innerClassName} max-w-screen-md w-full min-h-screen p-2`}
      >
        {children}
      </div>
    </div>
  );
};

export { Container };
