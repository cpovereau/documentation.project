import React from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import RichTextEditor from "./RichTextEditor";
import SidebarRight from "./SidebarRight";
import QuestionsExercises from "./QuestionsExercises";
import "./styles.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isSidebarRightOpen, setIsSidebarRightOpen] = React.useState(true);
  const [activeRubrique, setActiveRubrique] = React.useState(null);

  return (
    <div className="app-container flex h-screen">
      {isSidebarOpen && (
        <Sidebar
          setActiveRubrique={setActiveRubrique}
        />
      )}

      <div className="main-content flex-1 flex flex-col">
        <TopBar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleSidebarRight={() => setIsSidebarRightOpen(!isSidebarRightOpen)}
        />

        <div className="editor-container flex-1 flex">
          <RichTextEditor rubrique={activeRubrique} />
          {isSidebarRightOpen && <SidebarRight rubrique={activeRubrique} />}
        </div>

        <QuestionsExercises rubrique={activeRubrique} />
      </div>
    </div>
  );
}

export default App;
