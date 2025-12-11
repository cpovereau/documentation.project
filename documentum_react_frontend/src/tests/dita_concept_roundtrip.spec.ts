import { describe, it, expect } from "vitest";
import { parseXmlToTiptap } from "../utils/xmlToTiptap";
import { tiptapToXml } from "../utils/tiptapToXml";

function assertDefined<T>(
  value: T | null | undefined,
  message = "Valeur attendue non définie"
): asserts value is T {
  expect(value).toBeDefined();
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * 🧪 Utilitaire pour normaliser le XML :
 * - trim()
 * - supprime les multiples espaces et retours
 * - enlève les indentations superflues
 * Pratique pour comparer deux XML structurellement équivalents.
 */
function normalize(xml: string): string {
  return xml
    .replace(/>\s+</g, "><")        // supprime whitespace entre balises
    .replace(/\s+/g, " ")           // espaces consécutifs
    .replace(/>\s+([^<])/g, ">$1")  // enlève l'espace après 
    .replace(/([^>])\s+</g, "$1<")  // enlève l'espace avant 
    .trim();
}

describe("DITA Concept — Round Trip Tests", () => {

  it("Round-trip: Concept minimal avec conbody", () => {
    const input = `
      <concept id="c1">
        <title>Titre du concept</title>
        <conbody>
          <p>Hello world</p>
        </conbody>
      </concept>
    `;

    const parsed = parseXmlToTiptap(input);
    const xmlOut = tiptapToXml(parsed);

    expect(normalize(xmlOut)).toBe(normalize(input));
  });

  it("Round-trip: Concept complet (title + shortdesc + prolog + conbody)", () => {
    const input = `
      <concept id="c99">
        <title>Mon concept avancé</title>
        <shortdesc>Un résumé court ici.</shortdesc>
        <prolog>
          <author>Christophe</author>
          <critdates>
            <created date="2025-01-01" />
          </critdates>
          <metadata>
            <audience>expert</audience>
          </metadata>
        </prolog>
        <conbody>
          <p>Texte principal…</p>
          <section>
            <title>Section A</title>
            <p>Contenu section A</p>
          </section>
        </conbody>
      </concept>
    `;

    const parsed = parseXmlToTiptap(input);

    // Vérification structure JSON
    expect(parsed[0].type).toBe("concept");
    expect(parsed[0].content?.[0].type).toBe("title");
    expect(parsed[0].content?.[1].type).toBe("shortdesc");
    expect(parsed[0].content?.[2].type).toBe("prolog");
    expect(parsed[0].content?.[3].type).toBe("conbody");

    const xmlOut = tiptapToXml(parsed);

    expect(normalize(xmlOut)).toBe(normalize(input));
  });

 it("Round-trip: Concept avec plusieurs sections imbriquées", () => {
  const input = `
    <concept id="deep">
      <title>Concept profond</title>
      <conbody>
        <section id="s1">
          <title>Niveau 1</title>
          <section id="s1a">
            <title>Niveau 2</title>
            <p>Texte niveau 2</p>
          </section>
        </section>
      </conbody>
    </concept>
  `;

  const parsed = parseXmlToTiptap(input);

  // On récupère le conbody
const conbody = parsed[0].content?.find((n) => n.type === "conbody");
assertDefined(conbody, "conbody absent du résultat TipTap");
assertDefined(conbody.content, "conbody.content absent");

// Section niveau 1
const sectionL1 = conbody.content[0];
assertDefined(sectionL1, "Section L1 absente");
expect(sectionL1.type).toBe("section");

// Section niveau 2 (imbriquée)
const sectionL2 = sectionL1.content?.find((n) => n.type === "section");
assertDefined(sectionL2, "Section niveau 2 absente");
expect(sectionL2.type).toBe("section");


  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
  });

  it("Round-trip: Concept avec shortdesc optionnel", () => {
    const input = `
      <concept id="noShortdesc">
        <title>Sans résumé</title>
        <conbody>
          <p>Contenu simple.</p>
        </conbody>
      </concept>
    `;

    const parsed = parseXmlToTiptap(input);

    // Vérifie qu'on n'a pas inséré un shortdesc fantôme
    expect(parsed[0].content?.some(n => n.type === "shortdesc")).toBe(false);

    const xmlOut = tiptapToXml(parsed);

    expect(normalize(xmlOut)).toBe(normalize(input));
  });

});

describe("DITA Codeblock — Round Trip", () => {

  it("Round-trip: Codeblock simple", () => {
    const input = `
      <codeblock language="javascript">
        console.log('Hello');
      </codeblock>
    `;

    const parsed = parseXmlToTiptap(input);

    expect(parsed[0].type).toBe("codeblock");
    expect(parsed[0].attrs?.language).toBe("javascript");

    const xmlOut = tiptapToXml(parsed);

    expect(normalize(xmlOut)).toBe(normalize(input));
  });
});

it("Round-trip: Tableau simple", () => {
  const input = `
    <table xml:id="t1">
      <tgroup cols="2">
        <thead>
          <row>
            <entry align="center">A</entry>
            <entry>B</entry>
          </row>
        </thead>
        <tbody>
          <row>
            <entry align="left">1</entry>
            <entry align="left">2</entry>
          </row>
        </tbody>
      </tgroup>
    </table>
  `;

  const parsed = parseXmlToTiptap(input);
  const xmlOut = tiptapToXml(parsed);
  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Reference simple", () => {
  const input = `
    <reference id="r1">
      <title>Titre ref</title>
      <prolog>
        <author>Christophe</author>
      </prolog>
      <refbody>
        <section>
          <p>Du contenu.</p>
        </section>
      </refbody>
    </reference>
  `;

  const parsed = parseXmlToTiptap(input);
  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Task complète", () => {
  const input = `
    <task id="t1">
      <title>Configurer la base</title>
      <prolog>
        <author>Christophe</author>
      </prolog>
      <taskbody>
        <steps>
          <step>
            <p>Ouvrir l'application.</p>
          </step>
          <step>
            <p>Cliquer sur Paramètres.</p>
          </step>
        </steps>
      </taskbody>
    </task>
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("task");
  expect(parsed[0].content?.some(n => n.type === "taskbody")).toBe(true);

  const xmlOut = tiptapToXml(parsed);
  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Example simple", () => {
  const input = `
    <example title="Mon exemple">
      <p>Ceci est un exemple.</p>
      <note>Attention !</note>
    </example>
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("example");
  expect(parsed[0].attrs?.title).toBe("Mon exemple");

  const xmlOut = tiptapToXml(parsed);
  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Figure simple", () => {
  const input = `
    <figure>
      <title>Capture d'écran</title>
      <image src="screen.png" />
    </figure>
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("figure");
  expect(parsed[0].content?.some(n => n.type === "title")).toBe(true);
  expect(parsed[0].content?.some(n => n.type === "image")).toBe(true);

  const xmlOut = tiptapToXml(parsed);
  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Glossentry simple", () => {
  const input = `
    <glossentry termid="G1" term="Cloud" definition="Ressources distantes." />
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("glossentry");
  expect(parsed[0].attrs?.termid).toBe("G1");
  expect(parsed[0].attrs?.term).toBe("Cloud");

  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: CrossReference simple", () => {
  const input = `
    <xref refid="C99">Voir la rubrique</xref>
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("crossReference");
  expect(parsed[0].attrs?.refid).toBe("C99");
  expect(parsed[0].attrs?.text).toBe("Voir la rubrique");

  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: DocTag simple", () => {
  const input = `
    <doc-tag type="audience">Expert</doc-tag>
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("docTag");
  expect(parsed[0].attrs?.type).toBe("audience");

  const txt = parsed[0].content?.[0];
  expect(txt?.type).toBe("text");
  expect(txt?.text).toBe("Expert");

  const xmlOut = tiptapToXml(parsed);
  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: InlineVariable simple", () => {
  const input = `
    <variable name="VERSION" />
  `;

  const parsed = parseXmlToTiptap(input);

  expect(parsed[0].type).toBe("inlineVariable");
  expect(parsed[0].attrs?.name).toBe("VERSION");

  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Concept Full Document", () => {
  const input = `
    <concept id="full1">
      <title>Concept complet</title>
      <shortdesc>Résumé du concept.</shortdesc>
      <prolog>
        <author>Christophe</author>
        <critdates>
          <created date="2025-01-01" />
        </critdates>
        <metadata>
          <audience>expert</audience>
        </metadata>
      </prolog>
      <conbody>
        <p>
          Introduction avec une
          <doc-tag type="audience">Admin</doc-tag>
          et une variable
          <variable name="VERSION" />
          ainsi qu'un lien
          <xref refid="REF1">Voir référence</xref>.
        </p>

        <section id="s1">
          <title>Section principale</title>
          <p>Texte dans la section principale.</p>

          <example title="Exemple d'utilisation">
            <p>Ceci est un exemple.</p>
          </example>

          <figure>
            <title>Schéma général</title>
            <image src="schema.png" />
          </figure>

          <codeblock language="javascript">
            console.log("Hello world");
          </codeblock>

          <table xml:id="t1">
            <tgroup cols="2">
              <thead>
                <row>
                  <entry align="center">Col1</entry>
                  <entry>Col2</entry>
                </row>
              </thead>
              <tbody>
                <row>
                  <entry align="left">V1</entry>
                  <entry align="left">V2</entry>
                </row>
              </tbody>
            </tgroup>
          </table>

          <note>Note importante.</note>

          <question>Quelle est la bonne réponse ?</question>
          <answer>C'est celle-ci.</answer>

          <glossentry termid="G1" term="Cloud" definition="Infrastructures distantes." />
        </section>
      </conbody>
    </concept>
  `;

  const parsed = parseXmlToTiptap(input);

  // Sanity checks minimales
  expect(parsed[0].type).toBe("concept");
  expect(parsed[0].content?.some(n => n.type === "conbody")).toBe(true);

  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Concept Ultra Complet (stress test)", () => {
  const input = `
    <concept id="mega1">
      <title>Concept Ultra Complet</title>
      <shortdesc>Document de test très complet.</shortdesc>

      <prolog>
        <author>Christophe</author>
        <critdates>
          <created date="2025-02-13" />
          <revised modified="2025-03-01" />
        </critdates>
        <metadata>
          <audience>expert</audience>
          <category>advanced</category>
        </metadata>
      </prolog>

      <conbody>

        <p>
          Ceci est un paragraphe introductif avec plusieurs éléments inline :
          <doc-tag type="audience">Admin</doc-tag>,
          <variable name="VERSION" />,
          une référence interne
          <xref refid="REF42">voir section 2</xref>
          et même une deuxième
          <xref refid="REF99">aller plus loin</xref>.
        </p>

        <section id="sA">
          <title>Section A — Présentation générale</title>

          <p>Texte simple avec une variable <variable name="PRODUIT" />.</p>

          <note>Note informative dans la Section A.</note>

          <p>Liste non ordonnée :</p>
          <itemizedlist>
            <listitem><p>Premier item</p></listitem>
            <listitem><p>Deuxième item</p></listitem>
            <listitem><p>Troisième item</p></listitem>
          </itemizedlist>

          <section id="sA1">
            <title>Section A.1 — Détails</title>

            <p>
              Dans cette section, nous insérons un exemple :
            </p>

            <example title="Cas d'utilisation">
              <p>Un exemple très instructif.</p>
              <note>Note interne à l'exemple.</note>
            </example>

            <figure>
              <title>Schéma A.1</title>
              <image src="schema_A1.png" />
            </figure>

            <codeblock language="javascript">
              // Exemple de code
              const message = "Hello 'world'";
              console.log(message);
            </codeblock>

            <orderedlist>
              <listitem><p>Étape 1</p></listitem>
              <listitem><p>Étape 2</p></listitem>
              <listitem><p>Étape 3</p></listitem>
            </orderedlist>

            <section id="sA1a">
              <title>Section A.1.a — Sous-détails</title>

              <note>Note profonde dans l'imbrication.</note>

              <p>Une variable : <variable name="DEEP_VAR" /> et un doc-tag <doc-tag type="feature">AUTH</doc-tag></p>

              <p>Fin de la sous-section.</p>
            </section>

          </section>
        </section>

        <section id="sB">
          <title>Section B — Exemples avancés</title>

          <table xml:id="tMega">
            <tgroup cols="3">
              <thead>
                <row>
                  <entry align="center">Col1</entry>
                  <entry align="center">Col2</entry>
                  <entry align="center">Col3</entry>
                </row>
                <row>
                  <entry>A</entry>
                  <entry>B</entry>
                  <entry>C</entry>
                </row>
              </thead>
              <tbody>
                <row>
                  <entry align="left">1</entry>
                  <entry align="left">2</entry>
                  <entry align="left">3</entry>
                </row>
                <row>
                  <entry align="left">4</entry>
                  <entry align="left">5</entry>
                  <entry align="left">6</entry>
                </row>
              </tbody>
            </tgroup>
          </table>

          <question>Quel est l'intérêt de ce test ?</question>
          <answer>Vérifier que tout fonctionne parfaitement.</answer>

          <glossentry termid="G42" term="Test" definition="Processus de vérification." />
        </section>

      </conbody>
    </concept>
  `;

  const parsed = parseXmlToTiptap(input);
  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Concept MAXIMAL Documentum (full stress test)", () => {
  const input = `
    <concept id="MAX99">
      <title>Documentum — Test maximal</title>
      <shortdesc>Test de validation complet de toutes les structures DITA + extensions internes.</shortdesc>

      <prolog>
        <author>Christophe</author>
        <critdates>
          <created date="2025-02-13" />
          <modified date="2025-03-01" />
        </critdates>
        <metadata>
          <audience>expert</audience>
          <product>PLA</product>
          <feature>AUTH</feature>
          <keywords>test,full,dita</keywords>
        </metadata>
      </prolog>

      <conbody>

        <p>
          Ceci est un paragraphe avec plusieurs éléments inline :
          <doc-tag type="audience">Admin</doc-tag>,
          une variable <variable name="VERSION" />,
          un lien interne <xref refid="REF-INTRO">voir introduction</xref>,
          et un second lien <xref refid="REF-DETAIL">détails plus bas</xref>.
        </p>

        <section id="S1">
          <title>Section 1 — Présentation générale</title>

          <p>Texte introductif dans la section 1.</p>

          <note>Note importante placée dans S1.</note>

          <p>Une liste non ordonnée :</p>
          <itemizedlist>
            <listitem><p>Premier item</p></listitem>
            <listitem><p>Deuxième item</p></listitem>
            <listitem><p>Troisième item</p></listitem>
          </itemizedlist>

          <section id="S1A">
            <title>Section 1.A — Détails avancés</title>

            <p>Texte dans 1.A, avec variable <variable name="VAR_A" />.</p>

            <example title="Cas d'utilisation réel">
              <p>Dans cet exemple, nous montrons un cas d'utilisation complet.</p>
              <note>Note interne à l'exemple.</note>
            </example>

            <figure>
              <title>Schéma d'utilisation</title>
              <image src="schema_global.png" />
            </figure>

            <codeblock language="javascript">
              // Exemple de code complexe
              const a = 10;
              const b = "texte avec 'apostrophes' et % caractères spéciaux";
              function test() {
                console.log(a, b);
              }
              test();
            </codeblock>

            <orderedlist>
              <listitem><p>Étape 1</p></listitem>
              <listitem><p>Étape 2</p></listitem>
              <listitem><p>Étape 3</p></listitem>
            </orderedlist>

            <section id="S1A1">
              <title>Section 1.A.1 — Sous-détails</title>

              <note>Note très profonde dans l’arborescence.</note>

              <p>
                Texte riche : variable <variable name="DEEP_VAR" />,
                doc-tag <doc-tag type="feature">GESTION</doc-tag>,
                lien <xref refid="REF-DEEP">profondeur</xref>.
              </p>

              <p>Fin de la sous-section 1.A.1.</p>
            </section>
          </section>
        </section>

        <section id="S2">
          <title>Section 2 — Tableaux avancés</title>

          <table xml:id="T99">
            <tgroup cols="3">

              <thead>
                <row>
                  <entry align="center">ColA</entry>
                  <entry align="center">ColB</entry>
                  <entry align="center">ColC</entry>
                </row>
                <row>
                  <entry>HA</entry>
                  <entry>HB</entry>
                  <entry>HC</entry>
                </row>
              </thead>

              <tbody>
                <row>
                  <entry align="left">1</entry>
                  <entry align="left">2</entry>
                  <entry align="left">3</entry>
                </row>
                <row>
                  <entry align="left">4</entry>
                  <entry align="left">5</entry>
                  <entry align="left">6</entry>
                </row>
              </tbody>

            </tgroup>
          </table>

          <question>Pourquoi ce test existe-t-il ?</question>
          <answer>Pour vérifier 100 % du pipeline XML → TipTap → XML.</answer>

          <glossentry termid="G-ULTIME" term="UltraTest" definition="Test complet de tous les éléments DITA." />
        </section>

      </conbody>
    </concept>
  `;

  const parsed = parseXmlToTiptap(input);
  const xmlOut = tiptapToXml(parsed);

  expect(normalize(xmlOut)).toBe(normalize(input));
});

it("Round-trip: Mix Concept + Task + Reference", () => {
  const inputConcept = `
    <concept id="C100">
      <title>Concept général</title>
      <shortdesc>Résumé du concept.</shortdesc>
      <prolog>
        <author>Christophe</author>
      </prolog>
      <conbody>
        <p>Introduction au concept avec une variable <variable name="V_CONC" />.</p>
        <section id="SC1">
          <title>Section concept</title>
          <p>Détails du concept.</p>
          <note>Note informative liée au concept.</note>
        </section>
      </conbody>
    </concept>
  `;

  const inputTask = `
    <task id="T200">
      <title>Tâche principale</title>
      <prolog>
        <author>Christophe</author>
      </prolog>
      <taskbody>
        <steps>
          <step><p>Étape 1 de la tâche.</p></step>
          <step><p>Étape 2 avec une variable <variable name="V_TASK" />.</p></step>
        </steps>
      </taskbody>
    </task>
  `;

  const inputReference = `
    <reference id="R300">
      <title>Référence fonctionnelle</title>
      <prolog>
        <author>Christophe</author>
      </prolog>
      <refbody>
        <section id="SR1">
          <title>Section de référence</title>
          <p>Texte de référence incluant une balise <doc-tag type="audience">Admin</doc-tag>.</p>
          <figure>
            <title>Schéma de référence</title>
            <image src="schema_ref.png" />
          </figure>
          <codeblock language="javascript">console.log("Ref");</codeblock>
        </section>
      </refbody>
    </reference>
  `;

  // 🧪 Test CONCEPT
  {
    const parsed = parseXmlToTiptap(inputConcept);
    const xmlOut = tiptapToXml(parsed);
    expect(normalize(xmlOut)).toBe(normalize(inputConcept));
  }

  // 🧪 Test TASK
  {
    const parsed = parseXmlToTiptap(inputTask);
    const xmlOut = tiptapToXml(parsed);
    expect(normalize(xmlOut)).toBe(normalize(inputTask));
  }

  // 🧪 Test REFERENCE
  {
    const parsed = parseXmlToTiptap(inputReference);
    const xmlOut = tiptapToXml(parsed);
    expect(normalize(xmlOut)).toBe(normalize(inputReference));
  }
});
