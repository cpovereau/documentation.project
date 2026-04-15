// src/types/ProjectDTO.ts
import { ProjectMap } from "./ProjectMap"

export interface ProjectDTO {
  id: number
  nom: string
  description?: string
  maps: ProjectMap[]
}
