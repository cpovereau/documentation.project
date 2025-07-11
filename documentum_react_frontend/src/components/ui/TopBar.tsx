import React, { useState } from "react";
import { Button } from "components/ui/button";
import { SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsModal from "@/screens/Settings/SettingsModal";

interface TopBarProps {
  currentScreen?: "desktop" | "product-doc-sync";
}

export const TopBar = ({ currentScreen = "desktop" }: TopBarProps) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  // Détermine le bouton switch selon l'écran courant
  const switchLabel =
    currentScreen === "desktop" ? "Sync Produit/Doc" : "Doc Principale";
  const targetScreen =
    currentScreen === "desktop" ? "/product-doc-sync" : "/desktop";

  return (
    <header className="w-full h-[103px] bg-black rounded-[15px] flex items-center justify-between px-5">
      {/* Logo */}
      <img
        className="w-36 h-20 sm:w-34 brightness-125 object-contain"
        alt="Logo"
        src="/logo.png"
      />

      {/* Texte bienvenue */}
      <div className="flex-1 ml-6 font-body-base text-white">
        <span>Bienvenue, </span>
        <span className="font-semibold text-2xl">Administrateur</span>
      </div>

      {/* Groupe de boutons à droite */}
      <div className="flex items-center gap-4">
        {/* Switch Desktop <-> ProductDocSync */}
        <Button
          variant="primary"
          onClick={() => navigate(targetScreen)}
          className="min-w-[160px] h-11 font-semibold text-base shadow"
        >
          {switchLabel}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          className="p-0 h-16 w-16 flex items-center justify-center"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon className="h-12 w-12 text-white" />
        </Button>

        {/* Déconnexion */}
        <Button
          variant="danger"
          className="min-w-[140px] h-11 font-semibold text-base shadow"
        >
          Déconnexion
        </Button>

        {showSettings && (
          <SettingsModal
            open={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </header>
  );
};
