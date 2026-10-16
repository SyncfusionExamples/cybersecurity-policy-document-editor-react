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

  const Btn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button className="e-btn" onClick={onClick}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6 }}>
        {Object.keys(SECTIONS).map((t) => (
          <Btn key={t} label={`Insert ${t}`} onClick={() => insertSection(editor(), t)} />
        ))}
        <Btn label="Generate Security Policy" onClick={() => generatePolicy(editor())} />
        <Btn label="Update TOC" onClick={() => editor().editor.updateToc()} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6 }}>
        <Btn label="Read Content" onClick={readContent} />
        <Btn label="Search" onClick={search} />
        <Btn label="Validate Policy" onClick={validate} />
        <Btn label="Add Comment" onClick={addComment} />
        <Btn label="Comment Summary" onClick={commentSummary} />
        <Btn label={`Track Changes: ${trackChanges ? 'On' : 'Off'}`} onClick={toggleTrackChanges} />
        <Btn label="Previous Revision" onClick={() => editor().selection.navigatePreviousRevision()} />
        <Btn label="Next Revision" onClick={() => editor().selection.navigateNextRevision()} />
        <Btn label="Accept All" onClick={() => editor().revisions.acceptAll()} />
        <Btn label="Reject All" onClick={() => editor().revisions.rejectAll()} />
        <Btn label="Save DOCX" onClick={() => editor().save('Information Security Policy', 'Docx')} />
        <Btn label="Export PDF" onClick={exportPdf} />
      </div>
      {output.length > 0 && (
        <pre style={{ margin: 0, padding: '6px 12px', background: '#f5f5f5' }}>{output.join('\n')}</pre>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        <DocumentEditorContainerComponent
          ref={container}
          height="100%"
          enableToolbar={true}
          created={() => generatePolicy(editor())}
          serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
        />
      </div>
    </div>
  );
}
