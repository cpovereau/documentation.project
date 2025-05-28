export const ScrollArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="scrollarea-rounded overflow-y-auto h-full bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] p-3 pb-7">
      {children}
    </div>
  );
};

export const ScrollBar = () => null;
