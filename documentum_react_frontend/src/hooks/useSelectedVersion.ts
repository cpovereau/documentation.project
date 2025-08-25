// src/hooks/useSelectedVersion.ts
import { useStore } from 'zustand';
import { useMemo } from 'react';
import useProjectStore from '@/store/projectStore';

export default function useSelectedVersion() {
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const projets = useProjectStore((s) => s.projets);

  const selectedVersion = useMemo(() => {
    const projet = projets.find((p) => p.id === selectedProjectId);
    return projet?.versionActive ?? null;
  }, [projets, selectedProjectId]);

  return {
    selectedVersion,
    selectedProjectId,
  };
}
