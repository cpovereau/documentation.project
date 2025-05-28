import React, { useState } from "react";
import { Button } from "components/ui/button";
import { ProjectModule } from "components/ui/ProjectModule";
import { MapModule } from "components/ui/MapModule";

interface LeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isExpanded,
  onToggle,
  className,
}) => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const toggleProjectExpand = () => setIsProjectExpanded(!isProjectExpanded);
  const toggleMapExpand = () => setIsMapExpanded(!isMapExpanded);

  return (
    <>
      <div
        className={`fixed top-[103px] bottom-0 left-0 transition-all duration-300 ease-in-out ${className}`}
        style={{ width: isExpanded ? "345px" : "0" }}
      >
        <div className="relative h-full">
          <div
            className={`h-full bg-[#f7a900] rounded-r-[15px] transition-all duration-300 ease-in-out`}
            style={{
              width: "345px",
              transform: isExpanded ? "translateX(0)" : "translateX(-345px)",
            }}
          >
            <div className="pt-20 px-4 overflow-hidden">
              <div className="min-h-[48px]">
                <ProjectModule
                  isExpanded={isProjectExpanded}
                  onToggle={toggleProjectExpand}
                  sidebarExpanded={isExpanded}
                />
              </div>
              {isExpanded && (
                <div className="mt-[62px] min-h-[48px]">
                  <MapModule
                    isExpanded={isMapExpanded}
                    onToggle={toggleMapExpand}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className={`fixed top-[120px] p-0 h-18 w-18 z-50 transition-all duration-300 ease-in-out hover:bg-gray-200`}
        style={{
          left: isExpanded ? "345px" : "0",
          transform: "translateX(-50%)",
        }}
        onClick={onToggle}
      >
        <img
          className={`w-full h-full transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
          alt="Leftbar toggle"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/leftbar-collapse.svg"
        />
      </Button>
    </>
  );
};
