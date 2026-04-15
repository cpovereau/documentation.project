import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    answer: {
      insertAnswer: (attrs?: { correct?: boolean; id?: string | null }) => ReturnType;
    };
    concept: {
      insertConcept: (attrs?: { id?: string | null }) => ReturnType;
    };
     important: {
      insertImportant: (attrs?: { id?: string | null }) => ReturnType;
    };
    note: {
      insertNote: (attrs?: { id?: string | null }) => ReturnType;
    };
    question: {
      insertQuestion: (attrs?: { id?: string | null }) => ReturnType;
    };
    reference: {
      insertReference: (attrs?: { id?: string | null }) => ReturnType;
    };
    task: {
      insertTask: (attrs?: { id?: string | null }) => ReturnType;
    };
    warning: {
      insertWarning: (attrs?: { id?: string | null }) => ReturnType;
    };
  }
}