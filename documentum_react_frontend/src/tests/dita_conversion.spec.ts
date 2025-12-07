import { parseXmlToTiptap } from "@/utils/xmlToTiptap";
import { tiptapToXml } from "@/utils/tiptapToXml";

function normalize(str: string) {
  return str
    .trim()
    // Normalisation des retours à la ligne
    .replace(/\r\n/g, "\n")
    // Suppression des espaces inutiles entre balises
    .replace(/>\s+</g, "><")
    // Trim par ligne
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("");
}


describe("DITA Round-Trip Tests", () => {
  test("Round-trip simple <p>", () => {
    const xml = `<p>Hello world</p>`;

    const json = parseXmlToTiptap(xml);
    const out = tiptapToXml(json);

    expect(normalize(out)).toBe(normalize(xml));
  });

  test("Round-trip <title> + <p>", () => {
    const xml = `
      <body>
        <title>Titre</title>
        <p>Texte</p>
      </body>
    `;

    const json = parseXmlToTiptap(xml);
    const out = tiptapToXml(json);

    expect(normalize(out)).toBe(normalize(`
      <title>Titre</title>
      <p>Texte</p>
    `));
  });

  test("Round-trip DITA Task simple", () => {
    const xml = `
      <task id="t1">
        <title>Créer un rendez-vous</title>
        <taskbody>
          <steps>
            <step>
              <p>Ouvrir le module RDV</p>
            </step>
          </steps>
        </taskbody>
      </task>
    `;

    const json = parseXmlToTiptap(xml);
    const out = tiptapToXml(json);

    expect(normalize(out)).toBe(normalize(xml));
  });

  test("Round-trip Steps + Step + Paragraph", () => {
    const xml = `
      <steps>
        <step><p>Étape 1</p></step>
        <step><p>Étape 2</p></step>
      </steps>
    `;

    const json = parseXmlToTiptap(xml);
    const out = tiptapToXml(json);

    expect(normalize(out)).toBe(normalize(xml));
  });
});
