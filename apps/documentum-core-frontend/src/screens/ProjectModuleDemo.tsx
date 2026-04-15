import React, { useState } from "react";
import { ProjectModule, ProjectItem } from "components/ui/ProjectModule";

const initialProjects: ProjectItem[] = [
  {
    id: 1,
    title: "Documentation Utilisateur Planning",
    gamme: "Planning",
    active: false,
  },
  { id: 2, title: "Documentation Utilisateur", gamme: "Usager", active: true },
];

export const ProjectModuleDemo: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(2);

  // Fonctions de gestion
  const handleSelect = (id: number) => setSelectedProjectId(id);

  const handleAdd = () => {
    const newId = projects.length
      ? Math.max(...projects.map((p) => p.id)) + 1
      : 1;
    setProjects([
      ...projects,
      {
        id: newId,
        title: `Nouveau Projet ${newId}`,
        gamme: "Nouvelle Gamme",
        active: false,
      },
    ]);
    setSelectedProjectId(newId);
  };

  const handleClone = (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      const newId = Math.max(...projects.map((p) => p.id)) + 1;
      setProjects([
        ...projects,
        {
          ...project,
          id: newId,
          title: project.title + " (Clone)",
        },
      ]);
      setSelectedProjectId(newId);
    }
  };

  const handleDelete = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id));
    setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
  };

  const handlePublish = (id: number) => {
    alert("Publier projet id: " + id);
  };

  const handleLoad = () => {
    alert("Charger projet (fonction à implémenter)");
  };

  return (
    <ProjectModule
      isExpanded={true}
      onToggle={() => {}}
      sidebarExpanded={true}
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelect={handleSelect}
      onAdd={handleAdd}
      onLoad={handleLoad}
      onClone={handleClone}
      onDelete={handleDelete}
      onPublish={handlePublish}
    />
  );
};
