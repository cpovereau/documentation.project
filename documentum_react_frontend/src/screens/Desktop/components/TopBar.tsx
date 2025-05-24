import React from "react";
import { Button } from "components/ui/button";
import { SettingsIcon } from "lucide-react";

const LogoutButton = () => (
  <Button className="bg-[#eb221e] text-[#fde8e7] hover:bg-[#d41c18] border border-solid border-[#bf0f0c]">
    <span className="font-single-line-body-base font-[number:var(--single-line-body-base-font-weight)] text-[length:var(--single-line-body-base-font-size)] tracking-[var(--single-line-body-base-letter-spacing)] leading-[var(--single-line-body-base-line-height)]">
      Déconnexion
    </span>
  </Button>
);

const SettingsButton = () => (
  <Button variant="ghost" size="icon" className="p-0 h-10 w-10">
    <SettingsIcon className="h-10 w-10 text-white" />
  </Button>
);

export const TopBar = (): JSX.Element => {
  return (
    <header className="w-full h-[103px] bg-black rounded-[15px] flex items-center justify-between px-5">
      <img
        className="w-[131px] h-[70px] object-cover"
        alt="Logo"
        src="https://c.animaapp.com/macke9kyh9ZtZh/img/logo.png"
      />
      <div className="flex-1 ml-6 [text-shadow:0px_4px_4px_#00000040] font-body-base text-white">
        <span className="tracking-[var(--body-base-letter-spacing)] leading-[var(--body-base-line-height)] font-[number:var(--body-base-font-weight)] text-[length:var(--body-base-font-size)]">
          Bienvenue,
        </span>
        <span className="font-semibold text-2xl tracking-[-0.12px] leading-[28.8px]">
          {" "}
          Administrateur
        </span>
      </div>
      <div className="flex items-center gap-4">
        <SettingsButton />
        <LogoutButton />
      </div>
    </header>
  );
};
