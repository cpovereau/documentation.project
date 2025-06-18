import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "ghost"
    | "success"
    | "disabled";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", variant = "primary", ...props }, ref) => {
    let variantClass = "";

    if (variant === "primary") {
      variantClass =
        "bg-blue-600 text-white border border-blue-800 hover:bg-blue-700";
    } else if (variant === "secondary") {
      variantClass =
        "bg-black text-white border border-gray-700 hover:bg-gray-800";
    } else if (variant === "danger") {
      variantClass =
        "bg-red-600 text-white border border-red-800 hover:bg-red-700";
    } else if (variant === "outline") {
      variantClass =
        "bg-white text-black border border-gray-300 hover:bg-gray-100";
    } else if (variant === "ghost") {
      variantClass = "bg-transparent text-black hover:bg-gray-200 border-none";
    } else if (variant === "success") {
      variantClass =
        "bg-green-600 text-white border border-green-800 hover:bg-green-700";
    }

    return (
      <button
        ref={ref}
        className={`rounded transition-all duration-200 ${variantClass} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
