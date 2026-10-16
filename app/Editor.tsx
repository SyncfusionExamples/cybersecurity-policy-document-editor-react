'use client';

import { registerLicense } from '@syncfusion/ej2-base';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ?? '');

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Editor() {
  return (
    <DocumentEditorContainerComponent
      height="100vh"
      enableToolbar={true}
      serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
    />
  );
}
