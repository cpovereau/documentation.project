import { useState } from 'react';
import apiClient from '@/lib/apiClient';

export function useLanguageTool() {
  const [loading, setLoading] = useState(false);

  async function checkText(text: string) {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/orthographe/', {
        text: text,
        language: 'fr'
      });
      return response.data.matches || [];
    } catch (error) {
      console.error("Erreur orthographe :", error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { checkText, loading };
}
