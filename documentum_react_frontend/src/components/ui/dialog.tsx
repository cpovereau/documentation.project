import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-[999] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-6 pb-6 shadow-lg",
        className
      )}
      {...props}
    >
      {props["aria-labelledby"] && (
        <RadixDialog.Title id={props["aria-labelledby"]} className="sr-only" />
      )}

      {children}

      <RadixDialog.Close className="absolute right-4 top-4">
        <X className="h-5 w-5 text-gray-600 hover:text-black" />
      </RadixDialog.Close>
    </RadixDialog.Content>
  </RadixDialog.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <RadixDialog.Title className="text-lg font-semibold">
    {children}
  </RadixDialog.Title>
);

export const DialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <RadixDialog.Description className="sr-only">
    {children}
  </RadixDialog.Description>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end gap-2">{children}</div>
);
