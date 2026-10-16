import type { DocumentEditor } from '@syncfusion/ej2-react-documenteditor';

export const SECTIONS: Record<string, string> = {
  Scope:
    'This policy applies to all employees, contractors, and systems that access ABC MSP or customer information assets.',
  Purpose:
    'The purpose of this policy is to protect the confidentiality, integrity, and availability of information assets.',
  Responsibilities:
    'The Security Officer maintains this policy. Managers enforce it. All employees must follow it and report violations.',
  'Access Control Policy':
    'Access is granted on a least-privilege basis. Password Length: 8. Multi-factor authentication is required for remote access.',
  'Incident Response Policy':
    'All security incidents must be reported within 24 hours. The Security Officer coordinates containment, eradication, and recovery.',
  'Compliance Requirements':
    'All employees must comply with ISO 27001, NIST, and customer security obligations.',
  'Review Cycle':
    'This policy is reviewed annually. Review Date: 1 January each year. Approval: Chief Information Officer.',
};

const STYLE_DEFS: Record<string, object> = {
  Title: {
    type: 'Paragraph',
    name: 'Title',
    basedOn: 'Normal',
    next: 'Normal',
    characterFormat: { fontSize: 28, fontFamily: 'Calibri Light' },
    paragraphFormat: { spaceAfter: 6 },
  },
  'Heading 1': {
    type: 'Paragraph',
    name: 'Heading 1',
    basedOn: 'Normal',
    next: 'Normal',
    link: 'Heading 1 Char',
    characterFormat: { fontSize: 16, fontFamily: 'Calibri Light', fontColor: '#2F5496' },
    paragraphFormat: { beforeSpacing: 12, afterSpacing: 0, outlineLevel: 'Level1' },
  },
};

// The blank document may not define every built-in style; create it first,
// otherwise applyStyle fails with "undefined is not valid JSON".
function applyStyle(editor: DocumentEditor, name: string) {
  if (!editor.documentHelper.styles.findByName(name) && STYLE_DEFS[name]) {
    editor.editor.createStyle(JSON.stringify(STYLE_DEFS[name]));
  }
  editor.editor.applyStyle(name);
}

// Appends a Heading 1 + body paragraph at the end of the document.
export function insertSection(editor: DocumentEditor, title: string) {
  editor.selection.moveToDocumentEnd();
  applyStyle(editor, 'Heading 1');
  editor.editor.insertText(title);
  editor.editor.onEnter();
  applyStyle(editor, 'Normal');
  editor.editor.insertText(SECTIONS[title]);
  editor.editor.onEnter();
}

export function generatePolicy(editor: DocumentEditor) {
  editor.openBlank();
  applyStyle(editor, 'Title');
  editor.editor.insertText('Information Security Policy');
  editor.editor.onEnter();
  applyStyle(editor, 'Normal');
  editor.editor.insertText('ABC MSP - Version 1.0');
  editor.editor.onEnter();
  editor.editor.insertPageBreak();
  applyStyle(editor, 'Heading 1');
  editor.editor.insertText('Table of Contents');
  editor.editor.onEnter();
  applyStyle(editor, 'Normal');
  editor.editor.insertTableOfContents();
  editor.editor.insertPageBreak();
  Object.keys(SECTIONS).forEach((title) => insertSection(editor, title));
  editor.editor.updateToc();

  editor.selection.goToHeader();
  editor.editor.insertText('ABC MSP - Information Security Policy');
  editor.selection.goToFooter();
  editor.editor.insertText('Confidential | Version 1.0 | Page ');
  editor.editor.insertPageNumber();
  editor.editor.insertText(' of ');
  editor.editor.insertPageCount();
  editor.selection.closeHeaderFooter();
  editor.selection.moveToDocumentStart();
}
