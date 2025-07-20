import { ChainedCommands } from "@tiptap/react";

declare module "@tiptap/react" {
  interface ChainedCommands {
    insertTask: () => ChainedCommands;
    insertConcept: () => ChainedCommands;
    insertReference: () => ChainedCommands;
  }
}