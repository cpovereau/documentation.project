import React from "react";
import { Button } from "components/ui/button";
import { SettingsIcon } from "lucide-react";

export const SettingsButton = () => {
  const handleSettings = () => {
    // Implement settings logic here
    console.log("Settings clicked");
  };

  return (
    <Button variant="ghost" className="p-0 h-10 w-10" onClick={handleSettings}>
      <SettingsIcon className="h-10 w-10 text-white" />
    </Button>
  );
};
