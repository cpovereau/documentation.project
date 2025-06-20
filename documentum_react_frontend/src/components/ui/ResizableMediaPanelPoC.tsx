import React, { useRef, useEffect, useState } from "react";

export const ResizableMediaPanelPoC: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(300); // valeur par défaut
  const [cardsToShow, setCardsToShow] = useState(0);

  const cardHeight = 110; // simulate MediaCard height

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setAvailableHeight(height);
        setCardsToShow(Math.floor(height / cardHeight));
      }
    };

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      updateSize();
    }

    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="media-container-style flex-1 min-h-[200px]"
    >
      <div className="text-sm text-gray-600 mb-2">
        Espace disponible : {availableHeight}px
        <br />
        Nombre de cartes possibles : {cardsToShow}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: cardsToShow }, (_, i) => (
          <div
            key={i}
            className="h-[110px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-700"
          >
            MediaCard simulée {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
