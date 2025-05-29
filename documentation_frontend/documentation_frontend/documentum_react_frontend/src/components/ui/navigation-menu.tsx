import * as React from "react";

// Menu principal
export const NavigationMenu: React.FC<
  React.HTMLAttributes<HTMLUListElement>
> = ({ children, ...props }) => <ul {...props}>{children}</ul>;

// Item de menu
export const NavigationMenuItem: React.FC<
  React.LiHTMLAttributes<HTMLLIElement>
> = ({ children, ...props }) => <li {...props}>{children}</li>;

// Liste d'items (wrapper, facultatif)
export const NavigationMenuList: React.FC<
  React.HTMLAttributes<HTMLUListElement>
> = ({ children, ...props }) => <ul {...props}>{children}</ul>;
