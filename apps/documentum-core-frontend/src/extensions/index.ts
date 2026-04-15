// 🧩 Extensions personnalisées pour Documentum
// Ce fichier centralise tous les exports des extensions TipTap v3
// pour faciliter leur import dans les éditeurs (ex: useEditor)


/// 📄 Extensions de base
export {Body} from './Body'                     // <body> (corps du document)
export {Shortdesc} from './Shortdesc'           // <shortdesc> (description courte)
export {Title} from './Title'                   // <title> (titre du document)
export {Note} from './Note'                     // <note> (Note, Warning, Attention)

/// 🔗 Références internes
export { CrossReference } from './CrossReference' // <xref refid="..." />

/// 🖼️ Médias
export { Image } from './Image'                   // <image src="..." />
export { Figure } from './Figure'                 // <figure><title>...</title><image/></figure>
export { Video } from './Video'                   // <video src="..." />

/// 📑 Listes structurées
export { BulletList, OrderedList, ListItem } from './Listes' // <itemizedlist>, <orderedlist>

/// 📘 Glossaire
export { Glossentry } from './Glossentry'         // <glossentry termid="..." />

/// 💡 Exemples illustratifs
export { Example } from './Example'             // <example title="...">...</example>

/// ✍️ Bloc de code avec options
export { Code } from './Code'                     // <codeblock language="..." />

/// ❓ Contenu pédagogique : Questions/Réponses
export { Question } from './Question' // <question>
export { Answer } from './Answer'     // <answer>

/// 🧠 Concepts, références, tâches (structure DITA)
export { Concept, Conbody } from './Concept'          // <concept>, <conbody>
export { Reference, Refbody} from './Reference'       // <reference>, <refbody>
export { Section } from './Section'                   // <section>
export { Task, Taskbody, Steps, Step } from './Task'  // <task>, <steps>, <step>

/// 🎓 Contenu d’apprentissage DITA Learning
export {
  LearningAssessment,
  LearningBody,
  LearningContent,
  LearningContentBody,
  LearningSummary,
} from './Learning' // <learningAssessment>, <learningBody>, etc.

/// 📄 Métadonnées
export { Prolog } from './Prolog'                 // <prolog>

/// 📊 Tableaux XML
export {
  CustomTable,
  CustomTableRow,
  CustomTableHeader,
  CustomTableCell
} from './Table'       // <table>, <thead>, <tbody>, etc.

/// ✅ Affichage des fautes grammaticales
export { GrammarHighlight } from './GrammarHighlight' // Décorations LanguageTool (lecture seule)

/// 🧩 Extensions personnalisées
export { StatusMarker } from './StatusMarker'         // Marqueur de statut (ajour, arevoir, modifie)
export { DocTag } from './DocTag'                     // Balise de document (doc-tag type="audience")
export { RubriqueMetadata } from './RubriqueMetadata' // Balise de métadonnées rubrique (rubrique-metadata)
export { InlineVariable } from './InlineVariable'     // Balise de variable inline (variable name="...")