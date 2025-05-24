import React from "react";
import { LogoutButton } from "./LogoutButton";
import { SettingsButton } from "./SettingsButton";
import { Button } from "components/ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const TopBar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMainPage = location.pathname === "/";

  const handleSyncClick = () => {
    if (isMainPage) {
      navigate("/product-doc-sync");
    } else {
      navigate("/");
    }
  };

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
        <Button
          onClick={handleSyncClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
          title="Aller à la page de synchronisation Produit/Documentation"
        >
          <RefreshCw className="w-4 h-4" />
          {isMainPage ? "Sync Produit/Doc" : "Doc Principale"}
        </Button>
        <SettingsButton />
        <LogoutButton />
      </div>
    </header>
  );
};
