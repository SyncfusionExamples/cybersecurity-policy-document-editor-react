# Cybersecurity Policy Document Editor (React + Next.js)

## Description and Purpose

A proof-of-concept web app that shows how a cybersecurity policy (for example an *Information Security Policy*) can be authored, validated, reviewed and exported inside the browser with the [Syncfusion React Document Editor](https://www.syncfusion.com/react-components/react-word-processor).

On start-up the app generates a complete, styled policy document (title page, table of contents, seven policy sections, header and footer with page numbers). A side panel then exposes programmatic operations on that document:

- Word-like editing, with DOCX and PDF export
- Template-based content insertion
- Content extraction, search and compliance validation
- Comments and track changes for review and approval

**Tech stack:** Next.js (App Router), React, TypeScript, `@syncfusion/ej2-react-documenteditor`, `@syncfusion/ej2-pdf-export`, Syncfusion Tailwind 3 theme.

## Features

All snippets come from `app/Editor.tsx` and `app/policy.ts`. In them, `editor()` is shorthand for `container.current!.documentEditor`.

### 1. Setup and license registration

The Document Editor container is registered with its toolbar module. The Syncfusion license key is read from an environment variable.

```tsx
registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ?? '');
DocumentEditorContainerComponent.Inject(Toolbar);
```

### 2. Policy generation from a template

`SECTIONS` in `policy.ts` is a map of section title to body text. `generatePolicy` opens a blank document and builds the title, table of contents, sections, header and footer. It runs automatically when the editor is created.

```tsx
<DocumentEditorContainerComponent
  ref={container}
  height="100%"
  enableToolbar={true}
  created={() => generatePolicy(editor())}
  serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
/>
```

```ts
export function generatePolicy(editor: DocumentEditor) {
  editor.openBlank();
  applyStyle(editor, 'Title');
  editor.editor.insertText('Information Security Policy');
  // ... table of contents, page breaks, sections
  Object.keys(SECTIONS).forEach((title) => insertSection(editor, title));
  editor.editor.updateToc();

  editor.selection.goToFooter();
  editor.editor.insertText('Confidential | Version 1.0 | Page ');
  editor.editor.insertPageNumber();
  editor.editor.insertText(' of ');
  editor.editor.insertPageCount();
}
```

### 3. Insert individual sections

One button is generated per entry in `SECTIONS`. Each appends a *Heading 1* plus body paragraph at the end of the document. `applyStyle` creates built-in styles (Title, Heading 1) when the blank document lacks them.

```ts
export function insertSection(editor: DocumentEditor, title: string) {
  editor.selection.moveToDocumentEnd();
  applyStyle(editor, 'Heading 1');
  editor.editor.insertText(title);
  editor.editor.onEnter();
  applyStyle(editor, 'Normal');
  editor.editor.insertText(SECTIONS[title]);
  editor.editor.onEnter();
}
```

Available sections: Scope, Purpose, Responsibilities, Access Control Policy, Incident Response Policy, Compliance Requirements, Review Cycle.

### 4. Save as DOCX, export to PDF, print, update TOC

DOCX is saved with the built-in API. PDF is built client-side by rendering each page to an image and placing it on a PDF page.

```tsx
editor().save('Information Security Policy', 'Docx');

const exportPdf = async () => {
  const pdf = new PdfDocument();
  pdf.pageSettings.margins.all = 0;
  for (let i = 1; i <= editor().pageCount; i++) {
    const image = editor().exportAsImage(i, 'Jpeg');
    await new Promise((resolve) => (image.onload = resolve));
    const page = pdf.pages.add();
    const { width, height } = page.getClientSize();
    page.graphics.drawImage(new PdfBitmap(image.src.replace('data:image/jpeg;base64,', '')), 0, 0, width, height);
  }
  pdf.save('Information Security Policy.pdf');
};

editor().print();
editor().editor.updateToc();
```

### 5. Read content

Selects the whole document, reads the text, and reports word count and serialized (SFDT) size.

```tsx
editor().selection.selectAll();
const text = editor().selection.text;
const words = text.split(/\s+/).filter(Boolean).length;
const sfdtLength = editor().serialize().length;
```

### 6. Search and policy validation

Search looks for key terms. Validation checks that required sections exist and shows ✅ or ❌ for each.

```tsx
const REQUIRED = ['Scope', 'Purpose', 'Responsibilities', 'Incident Response', 'Review Date'];

const found = (term: string) => {
  editor().search.findAll(term);
  const count = editor().search.searchResults.length;
  editor().search.searchResults.clear();
  return count > 0;
};

const validate = () =>
  setOutput(['Policy Validation Result', ...REQUIRED.map((t) => `${found(t) ? '✅' : '❌'} ${t}`)]);
```

### 7. Comments

Add a comment at the current selection and summarize open versus resolved comments.

```tsx
editor().editor.insertComment(text);

const comments = editor().getComments();
const resolved = comments.filter((c) => c.commentProperties?.isResolved).length;
// `${comments.length - resolved} Open Comments`, `${resolved} Resolved Comments`
```

### 8. Versioning and approval (track changes)

Toggle track changes, move between revisions, and accept or reject them.

```tsx
editor().enableTrackChanges = !trackChanges;
editor().selection.navigatePreviousRevision();
editor().selection.navigateNextRevision();
editor().revisions.acceptAll();
editor().revisions.rejectAll();
```

## Folder Structure

```
cybersecurity-policy-document-editor-react/
├── app/
│   ├── Editor.tsx      # Client component: Document Editor + action side panel (all features)
│   ├── policy.ts       # Policy template (SECTIONS), style helpers, generatePolicy / insertSection
│   ├── page.tsx        # Home route; renders <Editor />
│   ├── layout.tsx      # Root layout and page metadata
│   └── globals.css     # Syncfusion Tailwind 3 theme import and layout styles
├── .env.example        # Template for the Syncfusion license key
├── next.config.mjs     # Next.js configuration (defaults)
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md
```

## How to Run the Sample

### Prerequisites

- Node.js 18.18 or later (Node 20+ recommended) and npm
- A Syncfusion license key. You can get a free [Community License](https://www.syncfusion.com/products/communitylicense) or a trial key. Without one, the editor shows a license banner.

### Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file and add your license key:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY=your_license_key_here
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`. The policy document loads automatically and the left panel shows the actions.

### Production build

```bash
npm run build
npm start
```

### Notes

- Operations that need server-side processing (such as importing files) use Syncfusion's public demo service, set in `serviceUrl` in `Editor.tsx`. For production, host your own Document Editor web service and update that URL.
- `NEXT_PUBLIC_` variables are embedded in the client bundle, which is expected for Syncfusion client-side license registration.
- Dependencies are declared as `*` / `latest`. Pin versions in `package.json` for reproducible builds.

### Suggested walkthrough

1. Click **Validate Policy** to confirm the required sections exist.
2. Click **Track Changes: Off** to turn it on, edit some text, then use **Next Revision** and **Accept All**.
3. Select text, click **Add Comment**, then **Comment Summary**.
4. Click **Save DOCX** or **Export PDF** to download the result.
