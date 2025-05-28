// src/utils/languageTool.js
export async function checkGrammar(text) {
  const response = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      text,
      language: 'fr',
    }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la vérification du texte");
  }

  const data = await response.json();
  return data.matches;  // Contient les erreurs trouvées et les suggestions
}
