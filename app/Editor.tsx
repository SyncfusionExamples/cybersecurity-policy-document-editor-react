'use client';

import { useRef, useState } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import { PdfBitmap, PdfDocument } from '@syncfusion/ej2-pdf-export';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { SECTIONS, generatePolicy, insertSection } from './policy';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ?? '');

DocumentEditorContainerComponent.Inject(Toolbar);

const REQUIRED = ['Scope', 'Purpose', 'Responsibilities', 'Incident Response', 'Review Date'];
const SEARCH_TERMS = ['Incident Response', 'Review Date', 'Approval', 'Password Length'];

export default function Editor() {
  const container = useRef<DocumentEditorContainerComponent>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [trackChanges, setTrackChanges] = useState(false);
  const editor = () => container.current!.documentEditor;

  const found = (term: string) => {
    editor().search.findAll(term);
    const count = editor().search.searchResults.length;
    editor().search.searchResults.clear();
    return count > 0;
  };

  const readContent = () => {
    editor().selection.selectAll();
    const text = editor().selection.text;
    console.log('Document Text:', text);
    editor().selection.moveToDocumentStart();
    const words = text.split(/\s+/).filter(Boolean).length;
    const sfdtLength = editor().serialize().length;
    setOutput([`Retrieved Successfully`, `Document Length: ${words} words`, `SFDT size: ${sfdtLength} characters`]);
  };

  const search = () =>
    setOutput(SEARCH_TERMS.map((t) => `${t} -> ${found(t) ? 'Found' : 'Not Found'}`));

  const validate = () =>
    setOutput(['Policy Validation Result', ...REQUIRED.map((t) => `${found(t) ? '✅' : '❌'} ${t}`)]);

  const addComment = () => {
    const text = prompt('Comment text', 'Please update password expiration policy.');
    if (text) editor().editor.insertComment(text);
  };

  const commentSummary = () => {
    const comments = editor().getComments();
    const resolved = comments.filter((c) => c.commentProperties?.isResolved).length;
    setOutput([`${comments.length - resolved} Open Comments`, `${resolved} Resolved Comments`]);
  };

  const toggleTrackChanges = () => {
    editor().enableTrackChanges = !trackChanges;
    setTrackChanges(!trackChanges);
  };

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

  const sections: { title: string; hint: string; actions: [string, () => void][] }[] = [
    {
      title: '1. Authoring & Word Export',
      hint: 'High-fidelity editing; DOCX/PDF output',
      actions: [
        ['Save DOCX', () => editor().save('Information Security Policy', 'Docx')],
        ['Export PDF', exportPdf],
      ],
    },
    {
      title: '2. Print Layout',
      hint: 'Print-oriented presentation',
      actions: [
        ['Print', () => editor().print()],
        ['Update TOC', () => editor().editor.updateToc()],
      ],
    },
    {
      title: '3. Generate & Insert',
      hint: 'Programmatic content insertion',
      actions: [
        ['Generate Security Policy', () => generatePolicy(editor())],
        ...Object.keys(SECTIONS).map((t): [string, () => void] => [`Insert ${t}`, () => insertSection(editor(), t)]),
      ],
    },
    {
      title: '4. Read Content',
      hint: 'Programmatic access to document text',
      actions: [
        ['Read Content', readContent],
        ['Search', search],
        ['Validate Policy', validate],
      ],
    },
    {
      title: '5. Comments',
      hint: 'Review and collaboration',
      actions: [
        ['Add Comment', addComment],
        ['Comment Summary', commentSummary],
      ],
    },
    {
      title: '6. Versioning & Approval',
      hint: 'Track changes and revision decisions',
      actions: [
        [`Track Changes: ${trackChanges ? 'On' : 'Off'}`, toggleTrackChanges],
        ['Previous Revision', () => editor().selection.navigatePreviousRevision()],
        ['Next Revision', () => editor().selection.navigateNextRevision()],
        ['Accept All', () => editor().revisions.acceptAll()],
        ['Reject All', () => editor().revisions.rejectAll()],
      ],
    },
  ];

  return (
    <div className="app">
      <aside className="side">
        <h1>Security Policy Editor</h1>
        {sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.hint}</p>
            <div className="actions">
              {s.actions.map(([label, fn]) => (
                <button key={label} className="e-btn" onClick={fn}>{label}</button>
              ))}
            </div>
          </section>
        ))}
        {output.length > 0 && <pre className="out" aria-live="polite">{output.join('\n')}</pre>}
      </aside>
      <main className="main">
        <DocumentEditorContainerComponent
          ref={container}
          height="100%"
          enableToolbar={true}
          created={() => generatePolicy(editor())}
          serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
        />
      </main>
    </div>
  );
}
