import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";

// Toutes les extensions personnalisées Documentum
import {
  // 📄 Base DITA
  Title,
  Shortdesc,
  Body,
  Prolog,
  Note,

  // 🔗 Références
  CrossReference,

  // 🖼️ Médias
  Image,
  Figure,
  Video,

  // 📘 Glossaire
  Glossentry,

  // 💡 Exemples
  Example,

  // ✍️ Code
  Code,

  // ❓ Pédagogie
  Question,
  Answer,

  // 🧠 Structure documentaire
  Concept,
  Conbody,
  Reference,
  Refbody,
  Section,
  Task,
  Taskbody,
  Steps,
  Step,

  // 🎓 Learning DITA
  LearningAssessment,
  LearningBody,
  LearningContent,
  LearningContentBody,
  LearningSummary,

  // 📊 Tableaux
  CustomTable,
  CustomTableRow,
  CustomTableHeader,
  CustomTableCell,

  // ✅ Vérification grammaticale
  GrammarHighlight,

  // 🧩 Spécifiques Documentum
  StatusMarker,
  DocTag,
  RubriqueMetadata,
  InlineVariable,
} from ".";

export const getAllExtensions = () => [
  StarterKit.configure({}),
  TextStyle,
  Color,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  GrammarHighlight.configure({ errors: [] }),

  // Base DITA
  Title,
  Shortdesc,
  Body,
  Prolog,
  Note,

  // Références
  CrossReference,

  // Médias
  Image,
  Figure,
  Video,

  // Glossaire
  Glossentry,

  // Exemples
  Example,

  // Code
  Code,

  // Pédagogie
  Question,
  Answer,

  // Structures
  Concept,
  Conbody,
  Reference,
  Refbody,
  Section,
  Task,
  Taskbody,
  Steps,
  Step,

  // DITA Learning
  LearningAssessment,
  LearningBody,
  LearningContent,
  LearningContentBody,
  LearningSummary,

  // Tableaux
  CustomTable,
  CustomTableRow,
  CustomTableHeader,
  CustomTableCell,

  // Spécifiques Documentum
  StatusMarker,
  DocTag,
  RubriqueMetadata,
  InlineVariable,
];
