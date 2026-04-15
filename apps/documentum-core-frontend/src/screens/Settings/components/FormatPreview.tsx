import React from "react";

interface FormatPreviewProps {
  contenu: string;
}

const FormatPreview: React.FC<FormatPreviewProps> = ({ contenu }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded-md overflow-auto h-64 text-sm text-mono whitespace-pre-wrap border">
      {contenu}
    </pre>
  );
};

export default FormatPreview;
