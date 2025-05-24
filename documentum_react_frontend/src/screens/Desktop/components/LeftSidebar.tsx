import React, { useState } from "react";
import { ProjectModule } from "./ProjectModule";
import { MapModule } from "./MapModule";

export const LeftSidebar = (): JSX.Element => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  return (
    <div className="w-[345px] h-[921px] bg-[#f7a900] rounded-[15px] relative">
      <img
        className="absolute w-12 h-12 top-2 right-[13px] cursor-pointer"
        alt="Leftbar collapse"
        src="https://c.animaapp.com/macke9kyh9ZtZh/img/leftbar-collapse.svg"
        onClick={() => {
          setIsProjectExpanded(false);
          setIsMapExpanded(false);
        }}
      />
      <ProjectModule
        isExpanded={isProjectExpanded}
        onToggle={() => setIsProjectExpanded(!isProjectExpanded)}
      />
      <MapModule
        isExpanded={isMapExpanded}
        onToggle={() => setIsMapExpanded(!isMapExpanded)}
      />
    </div>
  );
};
