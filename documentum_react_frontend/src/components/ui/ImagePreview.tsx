import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ImagePreviewProps {
  imageUrl: string;
  children: React.ReactNode;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const imgWidth = 320;
      const padding = 8;
      setPosition({
        top: rect.top,
        left: rect.left - imgWidth - padding, // ← affiche à gauche
      });
    }
  }, [visible]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="inline-block"
    >
      {children}

      {visible &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <img
              src={imageUrl}
              alt="Aperçu"
              className="max-w-[320px] max-h-[320px] object-contain rounded shadow-xl border border-gray-200 bg-white"
            />
          </div>,
          document.body
        )}
    </div>
  );
};
