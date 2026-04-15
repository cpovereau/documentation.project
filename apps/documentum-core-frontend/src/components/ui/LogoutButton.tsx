import React from "react";
import { Button } from "components/ui/button";

export const LogoutButton = () => {
  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logout clicked");
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-[#eb221e] text-[#fde8e7] hover:bg-[#d41c18] border border-solid border-[#bf0f0c]"
    >
      <span className="font-single-line-body-base font-[number:var(--single-line-body-base-font-weight)] text-[length:var(--single-line-body-base-font-size)] tracking-[var(--single-line-body-base-letter-spacing)] leading-[var(--single-line-body-base-line-height)]">
        Déconnexion
      </span>
    </Button>
  );
};
