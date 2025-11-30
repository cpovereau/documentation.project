# create-tiptap-extension

# Create TipTap Extension (v3)
This command generates a new custom TipTap v3 extension.

Ask the user for:
- extension name
- associated XML tag (optional)
- folder (default: src/extensions)

Rules:
- Generate a TypeScript file named <ExtensionName>.ts
- Use TipTap v3 Extension.create()
- Include at least:
  - name
  - group
  - parseHTML()
  - renderHTML()
- Respect Documentum custom node conventions
- Add named export (export const <Name> = Extension.create({...}))
- Automatically append export to src/extensions/index.ts

This command will be available in chat with /create-tiptap-extension
