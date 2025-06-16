export const ScrollArea = ({
  children,
  maxHeight = "400px",
}: {
  children: React.ReactNode;
  maxHeight?: string;
}) => {
  return (
    <div
      className="scrollarea-rounded overflow-y-auto bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] p-3 pb-7"
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
};

export const ScrollBar = () => null;
