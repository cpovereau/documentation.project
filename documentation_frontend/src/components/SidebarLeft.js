// src/components/SidebarLeft.js
import React, { useState } from 'react';
import ProjectContainer from './ProjectContainer';
import MapsContainer from './MapsContainer';

const SidebarLeft = () => {
  const [isProjectOpen, setProjectOpen] = useState(true);
  const [isMapsOpen, setMapsOpen] = useState(true);

  return (
    <div className="sidebar-left">
      <div onClick={() => setProjectOpen(!isProjectOpen)}>
        Projet
        {isProjectOpen && <ProjectContainer />}
      </div>
      <div onClick={() => setMapsOpen(!isMapsOpen)}>
        Maps
        {isMapsOpen && <MapsContainer />}
      </div>
    </div>
  );
};

export default SidebarLeft;
