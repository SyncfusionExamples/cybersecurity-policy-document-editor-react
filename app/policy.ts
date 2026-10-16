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

// Appends a Heading 1 + body paragraph at the end of the document.
export function insertSection(editor: DocumentEditor, title: string) {
  editor.selection.moveToDocumentEnd();
  editor.editor.applyStyle('Heading 1');
  editor.editor.insertText(title);
  editor.editor.onEnter();
  editor.editor.applyStyle('Normal');
  editor.editor.insertText(SECTIONS[title]);
  editor.editor.onEnter();
}

export function generatePolicy(editor: DocumentEditor) {
  editor.openBlank();
  editor.editor.applyStyle('Title');
  editor.editor.insertText('Information Security Policy');
  editor.editor.onEnter();
  editor.editor.applyStyle('Normal');
  editor.editor.insertText('ABC MSP - Version 1.0');
  editor.editor.onEnter();
  editor.editor.insertPageBreak();
  editor.editor.applyStyle('Heading 1');
  editor.editor.insertText('Table of Contents');
  editor.editor.onEnter();
  editor.editor.applyStyle('Normal');
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
