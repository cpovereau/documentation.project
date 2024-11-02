// src/components/SidebarRight.js
import React, { useState } from 'react';
import AttributesContainer from './AttributesContainer';
import ImagesContainer from './ImagesContainer';
import VideosContainer from './VideosContainer';

const SidebarRight = () => {
  const [isAttributesOpen, setAttributesOpen] = useState(true);
  const [isImagesOpen, setImagesOpen] = useState(true);
  const [isVideosOpen, setVideosOpen] = useState(true);

  return (
    <div className="sidebar-right">
      <div onClick={() => setAttributesOpen(!isAttributesOpen)}>
        Attributs
        {isAttributesOpen && <AttributesContainer />}
      </div>
      <div onClick={() => setImagesOpen(!isImagesOpen)}>
        Images
        {isImagesOpen && <ImagesContainer />}
      </div>
      <div onClick={() => setVideosOpen(!isVideosOpen)}>
        Vidéos
        {isVideosOpen && <VideosContainer />}
      </div>
    </div>
  );
};

export default SidebarRight;
