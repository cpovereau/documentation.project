import { useState, useEffect } from "react";

export function useContentChangeTracker(content: string) {
  const [initialContent, setInitialContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  const resetInitialContent = () => setInitialContent(content);

  return { hasChanges, resetInitialContent };
}
