import React from "react";

function RichTextEditor({ rubrique }) {
  if (!rubrique) {
    return (
      <div className="rich-text-editor bg-white border p-4 flex-1">
        <p className="text-gray-500">Sélectionnez une rubrique pour commencer à éditer...</p>
      </div>
    );
  }

  return (
    <div className="rich-text-editor bg-white border p-4 flex-1">
      <div className="toolbar mb-4 flex items-center">
        <button className="btn bg-gray-200 px-3 py-1 mr-2">B</button>
        <button className="btn bg-gray-200 px-3 py-1 mr-2">I</button>
        <button className="btn bg-gray-200 px-3 py-1 mr-2">U</button>
        <button className="btn bg-gray-200 px-3 py-1">Image</button>
      </div>

      <textarea
        className="editor w-full h-full border rounded p-2"
        placeholder="Commencez à écrire..."
        defaultValue={rubrique.titre + "\n" + rubrique.contenu}
      ></textarea>
    </div>
  );
}

export default RichTextEditor;
