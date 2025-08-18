import { useEffect, useState } from "react"
import { api } from "@/lib/apiClient"

export interface MediaItem {
  id: number
  nom_fichier: string
  chemin_acces: string
  description?: string
  type_media: "image" | "video"
  produit: number
  rubrique?: number | null
}

interface UseMediasOptions {
  produitId?: number
  fonctionnaliteCode?: string
  interfaceCode?: string;
  searchTerm?: string
  mediaRefreshKey?: number
}

export const useMedias = ({ produitId, fonctionnaliteCode, interfaceCode, searchTerm, mediaRefreshKey }: UseMediasOptions = {}) => {
  const [medias, setMedias] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const fetchMedias = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await api.get<MediaItem[]>("/media-items/")
      let results = res.data

      // 🔎 Filtres simulés côté client
      if (produitId) {
        results = results.filter(m => m.produit === produitId)
      }

      if (fonctionnaliteCode) {
      results = results.filter(m =>
       m.nom_fichier.toLowerCase().includes(fonctionnaliteCode.toLowerCase()) ||
       m.description?.toLowerCase().includes(fonctionnaliteCode.toLowerCase())
      )
      }

      if (interfaceCode) {
      results = results.filter(m =>
       m.nom_fichier.toLowerCase().includes(interfaceCode.toLowerCase()) ||
       m.description?.toLowerCase().includes(interfaceCode.toLowerCase())
      )
      }

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase()
        results = results.filter(m =>
          m.nom_fichier.toLowerCase().includes(lowerTerm) ||
          m.description?.toLowerCase().includes(lowerTerm)
        )
      }

      setMedias(results)
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des médias")
    } finally {
      setLoading(false)
    }
  }

  fetchMedias()
}, [produitId, fonctionnaliteCode, interfaceCode, searchTerm, mediaRefreshKey])


  return { medias, loading, error }
}
