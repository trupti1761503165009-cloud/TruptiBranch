
const path = require('path');

const SOPToolsPath = path.join(__dirname, '..', 'sop-tools', 'node_modules');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, Footer, Header, PageNumber, convertInchesToTwip, UnderlineType
} = require(path.join(SOPToolsPath, 'docx'));

const fs = require('fs');
const outputDir = path.join(__dirname, '..', 'Project Documents');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ─── COLOURS ────────────────────────────────────────────────────────────────
const BRAND  = '1B2A4A';
const ACCENT = '1E88E5';
const LIGHT  = 'EBF2FC';
const LIGHT2 = 'F0F4F8';
const GREEN  = '1B5E20';
const ORANGE = 'E65100';
const GREY   = '555555';
const WHITE  = 'FFFFFF';
const RED    = 'B71C1C';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const h1 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_1,
  spacing: { before: 440, after: 180 },
  border: { bottom: { color: ACCENT, size: 8, style: BorderStyle.SINGLE, space: 4 } },
  run: { color: BRAND, bold: true, size: 34 }
});

const h2 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 120 },
  run: { color: BRAND, bold: true, size: 28 }
});

const h3 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 80 },
  run: { color: ACCENT, bold: true, size: 24 }
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 22, color: GREY, ...opts })]
});

const pEmpty = () => new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: '' })] });

const bullet = (text, level = 0) => new Paragraph({
  bullet: { level },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, size: 22, color: GREY })]
});

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const infoBox = (label, value) => new Paragraph({
  spacing: { before: 80, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT },
  children: [
    new TextRun({ text: label + ': ', bold: true, color: BRAND, size: 22 }),
    new TextRun({ text: value, size: 22, color: GREY }),
  ]
});

const noteBox = (text) => new Paragraph({
  spacing: { before: 80, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: 'FFF8E1' },
  children: [
    new TextRun({ text: 'Note: ', bold: true, color: ORANGE, size: 22 }),
    new TextRun({ text, size: 22, color: GREY }),
  ]
});

const labelPara = (label, value) => new Paragraph({
  spacing: { before: 60, after: 60 },
  children: [
    new TextRun({ text: label + ': ', bold: true, color: BRAND, size: 22 }),
    new TextRun({ text: value, size: 22, color: GREY }),
  ]
});

const codeText = (text) => new Paragraph({
  spacing: { before: 60, after: 60 },
  shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
  children: [new TextRun({ text, size: 20, color: '333333', font: 'Courier New' })]
});

const thCell = (text, width) => new TableCell({
  width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
  shading: { type: ShadingType.CLEAR, fill: BRAND },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: [new Paragraph({
    children: [new TextRun({ text, bold: true, color: WHITE, size: 20 })]
  })]
});

const tdCell = (text, shade) => new TableCell({
  shading: shade ? { type: ShadingType.CLEAR, fill: LIGHT2 } : {},
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
  children: [new Paragraph({
    children: [new TextRun({ text, size: 20, color: GREY })]
  })]
});

const tdCode = (text, shade) => new TableCell({
  shading: shade ? { type: ShadingType.CLEAR, fill: LIGHT2 } : { type: ShadingType.CLEAR, fill: 'F5F5F5' },
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
  children: [new Paragraph({
    children: [new TextRun({ text, size: 18, color: '333333', font: 'Courier New' })]
  })]
});

const makeTable = (headers, rows, widths) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => thCell(h, widths ? widths[i] : null))
    }),
    ...rows.map((r, ri) => new TableRow({
      children: r.map((cell, ci) => {
        const shade = ri % 2 === 1;
        if (typeof cell === 'object' && cell.code) return tdCode(cell.text, shade);
        return tdCell(typeof cell === 'string' ? cell : cell.text || '', shade);
      })
    }))
  ]
});

// ─── TITLE PAGE ──────────────────────────────────────────────────────────────
const coverPage = [
  new Paragraph({ spacing: { before: 1400, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DRUG MANAGEMENT SYSTEM', bold: true, color: BRAND, size: 56 })] }),
  new Paragraph({ spacing: { before: 0, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Power Automate Flows — Technical Specification', bold: true, color: ACCENT, size: 38 })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Adobe Sign Integration & Status Email Automation', size: 26, color: GREY })] }),
  new Paragraph({ spacing: { before: 600, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Document Reference: DMS-PA-001', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Version: 1.0', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Prepared: March 2026', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Prepared by: Treta Infotech', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Audience: Power Automate Developer', size: 22, color: GREY, italics: true })] }),
  pageBreak(),
];

// ─── TABLE OF CONTENTS ───────────────────────────────────────────────────────
const tocSection = [
  h1('Table of Contents'),
  p('1.  Overview & Flow Interaction Summary'),
  p('2.  Implementation Assumptions'),
  p('3.  SharePoint Lists Reference'),
  p('    3.1  eSignature List — Column Definitions'),
  p('    3.2  DMS Documents List — Column Definitions'),
  p('4.  Workflow 1 — DMS - Adobe Sign Implementation'),
  p('    4.1  Trigger & Condition'),
  p('    4.2  Step-by-Step Actions'),
  p('    4.3  Dynamic Value Map'),
  p('5.  Workflow 2 — DMS - Adobe Auto Save Signed Document'),
  p('    5.1  Trigger & Condition'),
  p('    5.2  Step-by-Step Actions'),
  p('    5.3  Storage Path Convention'),
  p('    5.4  Dynamic Value Map'),
  p('6.  Workflow 3 — DMS - Status Email Notification'),
  p('    6.1  Trigger & Condition'),
  p('    6.2  Switch Cases & Email Templates'),
  p('    6.3  Reset Step'),
  p('    6.4  Dynamic Value Map'),
  p('7.  Cross-Flow Dynamic Value Quick-Reference'),
  pageBreak(),
];

// ─── SECTION 1: OVERVIEW ─────────────────────────────────────────────────────
const section1 = [
  h1('1. Overview & Flow Interaction Summary'),
  p('These three Power Automate flows automate the Adobe Sign e-signature process, auto-save signed documents back to SharePoint, and send status-based email notifications throughout the DMS document lifecycle.'),
  pEmpty(),
  h2('1.1  Document Status Lifecycle'),
  makeTable(
    ['Status', 'Description', 'Who Sets It'],
    [
      ['Draft', 'Initial state — Author is working on the document', 'Author (SPFx app)'],
      ['Pending Approval', 'Submitted for Approver review', 'Author (SPFx app)'],
      ['Approved', 'Approver cleared the document', 'Approver (SPFx app)'],
      ['Rejected', 'Approver returned with comments', 'Approver (SPFx app)'],
      ['Pending for Signature', 'e-Signature process initiated', 'Author (SPFx app)'],
      ['Signed', 'Adobe Sign agreement completed', 'Flow 2 (Power Automate)'],
      ['Final', 'Fully finalized and filed', 'System (SPFx app)'],
    ]
  ),
  pEmpty(),
  h2('1.2  Flow Interaction Summary'),
  makeTable(
    ['Flow', 'Trigger', 'Core Purpose'],
    [
      ['Flow 1 — Adobe Sign Implementation', 'eSignature list item created (SignatureStatus = Pending)', 'Send Adobe Sign agreement to Approver + Signer'],
      ['Flow 2 — Adobe Auto Save Signed Document', 'Adobe Sign agreement state = SIGNED', 'Download signed PDF and save to SharePoint'],
      ['Flow 3 — Status Email Notification', 'DMS Documents item modified (IsEmailSend = true)', 'Send Outlook emails for each status transition; reset flag'],
    ]
  ),
  pEmpty(),
  h2('1.3  Required Connectors'),
  makeTable(
    ['Connector', 'Used By'],
    [
      ['SharePoint', 'Flow 1, Flow 2, Flow 3'],
      ['Adobe Acrobat Sign', 'Flow 1, Flow 2'],
      ['Office 365 Outlook', 'Flow 3'],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 2: IMPLEMENTATION ASSUMPTIONS ───────────────────────────────────
const section2 = [
  h1('2. Implementation Assumptions'),
  p('Verify each item below before enabling flows in production. All three flows depend on these conditions being met.'),
  pEmpty(),
  makeTable(
    ['#', 'Assumption', 'Impact if Not Met'],
    [
      ['1', 'The eSignature SharePoint list exists with all 17 required columns', 'Flow 1 trigger will fail; fields will not resolve'],
      ['2', 'The DMS Documents list has IsEmailSend (Yes/No), Status (Choice), Author / Reviewer / Approver (Person or Group) columns', 'Flows 1, 2, 3 update steps will fail'],
      ['3', 'Signed Documents library exists under Shared Documents/Signed Documents/ with DocumentType/DrugName/CTDFolder sub-folder structure (or flow is configured to create folders)', 'Flow 2 Create file step will fail with path-not-found error'],
      ['4', 'Adobe Acrobat Sign connector is authenticated with an account that can create agreements', 'Flows 1 and 2 Adobe Sign steps will fail with auth errors'],
      ['5', 'Office 365 Outlook connector is authenticated with a shared mailbox or service account for outbound email', 'Flow 3 Send email steps will fail'],
      ['6', 'SharePoint connector is authenticated for the target site', 'All SharePoint action steps in all three flows will fail'],
      ['7', 'Author, Reviewer, and Approver columns on DMS Documents are Person or Group columns (not plain text)', 'Flow 3 email recipient expressions will return blank values'],
      ['8', 'SPFx app sets SignatureStatus = Pending when creating eSignature item, and sets IsEmailSend = true on DMS Documents status changes', 'Flows 1 and 3 trigger conditions will never pass'],
      ['9', 'Internal column names match exactly those used in the expressions in this document', 'Flow expressions will return null/empty values'],
      ['10', 'Action display names within each flow are set exactly as specified in the step tables', 'outputs() references in downstream steps will break — see note below'],
    ]
  ),
  pEmpty(),
  noteBox('Action naming: Power Automate auto-generates internal action names by replacing spaces with underscores. The expressions in this document assume the exact action display names shown in each step table. If you rename an action, update all outputs() references that depend on it.'),
  pEmpty(),
  noteBox('Regenerating this Word document: Run "node scripts/generate-pa-flows-doc.js" from the repo root after installing sop-tools dependencies (cd sop-tools && npm install). Output is written to Project Documents/DMS-Power-Automate-Flows.docx.'),
  pageBreak(),
];

// ─── SECTION 3: LISTS REFERENCE ──────────────────────────────────────────────
const section3Lists = [
  h1('3. SharePoint Lists Reference'),
  h2('3.1  eSignature List — Column Definitions'),
  p('List Name: eSignature  |  Purpose: Queue documents for Adobe Sign processing'),
  pEmpty(),
  makeTable(
    ['Column (Internal Name)', 'Type', 'Description'],
    [
      ['Title', 'Single line', 'Document name'],
      ['FilePath', 'Single line', 'Server-relative URL to the source file (e.g., /sites/DMS/DMSDocuments/file.docx)'],
      ['FileName', 'Single line', 'Filename with extension (e.g., Protocol_v2.docx)'],
      ['SignerEmail', 'Single line', 'Email of the primary signer (Reviewer)'],
      ['ApproverEmail', 'Single line', 'Email of the Approver'],
      ['SignatureStatus', 'Choice', 'Pending | Sent | Signed'],
      ['AgreementId', 'Single line', 'Adobe Sign agreement ID (written by Flow 1)'],
      ['DocumentId', 'Number', 'ID of the item in DMS Documents list'],
      ['DocumentType', 'Choice', 'eCTD | TMF | GMP'],
      ['CTDFolder', 'Single line', 'CTD/TMF/GMP folder segment (used for storage path)'],
      ['CTDModule', 'Single line', 'Module/section descriptor'],
      ['DrugName', 'Single line', 'Drug/product name (used for storage path)'],
      ['DrugId', 'Number', 'Lookup ID from Drugs Database list'],
      ['InitiatedBy', 'Single line', 'Display name of user who initiated signing'],
      ['InitiatedDate', 'Date/Time', 'ISO timestamp when signing was initiated'],
      ['SignatureCompletedOn', 'Date/Time', 'ISO timestamp when signing completed (written by Flow 2)'],
      ['SignedDocumentPath', 'Single line', 'Server-relative path to the saved signed PDF (written by Flow 2)'],
    ]
  ),
  pEmpty(),
  h2('3.2  DMS Documents List — Column Definitions'),
  p('List Name: DMS Documents  |  Purpose: Master document registry and lifecycle tracking'),
  pEmpty(),
  makeTable(
    ['Column (Internal Name)', 'Type', 'Description'],
    [
      ['ID', 'Number (auto)', 'SharePoint item ID'],
      ['Title', 'Single line', 'Document name'],
      ['Status', 'Choice', 'Draft | Pending Approval | Approved | Rejected | Pending for Signature | Signed | Final'],
      ['IsEmailSend', 'Yes/No', 'Email trigger flag — set true on status change, reset false by Flow 3'],
      ['Author', 'Person or Group', 'Document author (person column)'],
      ['AuthorId', 'Number', 'Lookup ID for Author'],
      ['Reviewer', 'Person or Group', 'Assigned reviewer / primary signer'],
      ['ReviewerId', 'Number', 'Lookup ID for Reviewer'],
      ['Approver', 'Person or Group', 'Assigned approver'],
      ['ApproverId', 'Number', 'Lookup ID for Approver'],
      ['Comments', 'Multi-line', 'JSON array of audit log entries'],
      ['CTDFolder', 'Single line', 'CTD/TMF/GMP folder path segment'],
      ['CTDModule', 'Single line', 'Module name/number'],
      ['Submodule', 'Single line', 'Submodule name'],
      ['Drug', 'Lookup', 'Drug/product from Drugs Database'],
      ['DrugId', 'Number', 'Lookup ID for Drug'],
      ['SharePointURL', 'Hyperlink', 'URL + Description pointing to the document file'],
      ['FileLeafRef', 'Single line', 'Filename with extension'],
      ['FileRef', 'Single line', 'Server-relative path to the file'],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 3: FLOW 1 ───────────────────────────────────────────────────────
const section3 = [
  h1('4. Workflow 1 — DMS - Adobe Sign Implementation'),
  infoBox('Flow Name', 'DMS - Adobe Sign Implementation'),
  infoBox('Trigger', 'SharePoint — When an item is created (eSignature list)'),
  infoBox('Purpose', 'Send an Adobe Sign agreement to Approver (order 1) and Signer (order 2) for the document referenced in the new eSignature record'),
  pEmpty(),

  h2('6.1  Trigger & Condition'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Connector', 'SharePoint'],
      ['Action', 'When an item is created'],
      ['Site Address', '[Your SharePoint Site URL]'],
      ['List Name', 'eSignature'],
    ]
  ),
  pEmpty(),
  p('After the trigger fires, the flow immediately checks whether to proceed:'),
  pEmpty(),
  h3('Condition — SignatureStatus = Pending?'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Action', 'Condition'],
      ['Left value', "triggerOutputs()?['body/SignatureStatus']"],
      ['Operator', 'is equal to'],
      ['Right value', 'Pending'],
      ['If No', 'Terminate — flow does not run for items already Sent or Signed'],
    ]
  ),
  pEmpty(),

  h2('5.2  Step-by-Step Actions'),
  h3('Step 2 — Get File Content'),
  p('Retrieve the binary content of the document from SharePoint using the server-relative path stored in the eSignature item.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Get file content', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static (environment)'],
      ['File Identifier', "triggerOutputs()?['body/FilePath']", 'eSignature.FilePath'],
    ]
  ),
  pEmpty(),

  h3('Step 3 — Create Adobe Sign Agreement'),
  p('Upload the document and create an agreement with two sequential participants.'),
  makeTable(
    ['Field', 'Value', 'Source'],
    [
      ['Connector', 'Adobe Acrobat Sign', 'Static'],
      ['Action', 'Create an agreement', 'Static'],
      ['Agreement name', "triggerOutputs()?['body/Title']", 'eSignature.Title'],
      ['File name', "triggerOutputs()?['body/FileName']", 'eSignature.FileName'],
      ['File content', "outputs('Get_file_content')?['body/$content']", 'Step 2 output'],
      ['Signature type', 'ESIGN', 'Static'],
      ['State', 'IN_PROCESS', 'Static'],
    ]
  ),
  pEmpty(),
  p('Participant configuration:', { bold: true }),
  makeTable(
    ['Participant Set', 'Role', 'Order', 'Email', 'Source'],
    [
      ['Participant Set 1', 'APPROVER', '1', "triggerOutputs()?['body/ApproverEmail']", 'eSignature.ApproverEmail'],
      ['Participant Set 2', 'SIGNER', '2', "triggerOutputs()?['body/SignerEmail']", 'eSignature.SignerEmail'],
    ]
  ),
  pEmpty(),

  h3('Step 4 — Update eSignature Item (Sent + AgreementId)'),
  p('Mark the eSignature record as Sent and store the AgreementId returned by Adobe Sign for later lookup by Flow 2.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Update item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'eSignature', 'Static'],
      ['Id', "triggerOutputs()?['body/ID']", 'Trigger — eSignature item ID'],
      ['SignatureStatus', 'Sent', 'Static'],
      ['AgreementId', "outputs('Create_an_agreement')?['body/id']", 'Adobe Sign Step 3 output'],
    ]
  ),
  pEmpty(),

  h3('Step 5 — Get DMS Documents Item'),
  p('Retrieve the corresponding DMS Documents item using the DocumentId stored in the eSignature record.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Get item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'DMS Documents', 'Static'],
      ['Id', "triggerOutputs()?['body/DocumentId']", 'eSignature.DocumentId'],
    ]
  ),
  pEmpty(),

  h3('Step 6 — Update DMS Documents Item (IsEmailSend = true)'),
  p('Set IsEmailSend = true to trigger Flow 3 (Status Email Notification). The Status was already set to "Pending for Signature" by the SPFx application.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Update item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'DMS Documents', 'Static'],
      ['Id', "outputs('Get_item')?['body/ID']", 'Step 5 — DMS Documents item ID'],
      ['IsEmailSend', 'true', 'Static'],
    ]
  ),
  pEmpty(),

  h2('4.3  Dynamic Value Map — Flow 1'),
  makeTable(
    ['Value Used', 'Expression', 'Source Column'],
    [
      ['Document name', "triggerOutputs()?['body/Title']", 'eSignature → Title'],
      ['File server-relative path', "triggerOutputs()?['body/FilePath']", 'eSignature → FilePath'],
      ['Filename with extension', "triggerOutputs()?['body/FileName']", 'eSignature → FileName'],
      ['Approver email', "triggerOutputs()?['body/ApproverEmail']", 'eSignature → ApproverEmail'],
      ['Signer email', "triggerOutputs()?['body/SignerEmail']", 'eSignature → SignerEmail'],
      ['eSignature item ID', "triggerOutputs()?['body/ID']", 'eSignature → ID (auto)'],
      ['DMS Documents item ID', "triggerOutputs()?['body/DocumentId']", 'eSignature → DocumentId'],
      ['Adobe Sign Agreement ID', "outputs('Create_an_agreement')?['body/id']", 'Adobe Sign Step 3 output'],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 4: FLOW 2 ───────────────────────────────────────────────────────
const section4 = [
  h1('5. Workflow 2 — DMS - Adobe Auto Save Signed Document'),
  infoBox('Flow Name', 'DMS - Adobe Auto Save Signed Document'),
  infoBox('Trigger', 'Adobe Sign — When agreement state changes to SIGNED'),
  infoBox('Purpose', 'Download the signed PDF from Adobe Sign and save it to the correct SharePoint path; update both eSignature and DMS Documents records'),
  pEmpty(),

  h2('6.1  Trigger & Condition'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Connector', 'Adobe Acrobat Sign'],
      ['Action', 'When an agreement is updated / state changes'],
      ['Scope', 'Account-level (all agreements)'],
    ]
  ),
  pEmpty(),
  h3('Condition — AgreementStatus = SIGNED?'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Action', 'Condition (after Initialize variable step)'],
      ['Left value', "variables('varAgreementStatus')"],
      ['Operator', 'is equal to'],
      ['Right value', 'SIGNED'],
      ['If No', 'Terminate — ignore partial signatures or approvals'],
    ]
  ),
  pEmpty(),

  h2('5.2  Step-by-Step Actions'),
  h3('Step 1 — Compose AgreementId'),
  p('Extract and store the AgreementId from the trigger body for reuse across multiple steps.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Action', 'Compose', 'Static'],
      ['Inputs', "triggerOutputs()?['body/id']", 'Adobe Sign trigger — agreement ID'],
      ['Output variable', 'varAgreementId (referenced as outputs("Compose"))', 'Step 1 output'],
    ]
  ),
  pEmpty(),

  h3('Step 2 — Initialize Variable: varAgreementStatus'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Action', 'Initialize variable', 'Static'],
      ['Name', 'varAgreementStatus', 'Static'],
      ['Type', 'String', 'Static'],
      ['Value', "triggerOutputs()?['body/status']", 'Adobe Sign trigger — agreement status'],
    ]
  ),
  pEmpty(),

  h3('Step 3 — Condition: AgreementStatus = SIGNED?'),
  p('(Described in section 4.1 above — this is the gate condition before downloading the PDF.)'),
  pEmpty(),

  h3('Step 4 — Download Signed PDF'),
  p('Call Adobe Sign to download the combined signed PDF.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'Adobe Acrobat Sign', 'Static'],
      ['Action', 'Get document', 'Static'],
      ['Agreement ID', "outputs('Compose')", 'Step 1 — varAgreementId'],
      ['Document type', 'COMBINED', 'Static — full signed PDF'],
    ]
  ),
  pEmpty(),

  h3('Step 5 — Get eSignature Record by AgreementId'),
  p('Find the eSignature list item that matches this agreement to retrieve document metadata needed for storage path construction and updates.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Get items', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'eSignature', 'Static'],
      ['Filter Query', "AgreementId eq '@{outputs('Compose')}'", 'Step 1 — varAgreementId'],
      ['Top Count', '1', 'Static'],
    ]
  ),
  pEmpty(),
  p('Key values extracted from this step (used in subsequent steps):', { bold: true }),
  makeTable(
    ['Field', 'Expression'],
    [
      ['eSign item ID', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']"],
      ['DMS Documents ID', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']"],
      ['Document name (Title)', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']"],
      ['DocumentType', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']"],
      ['DrugName', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']"],
      ['CTDFolder', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']"],
    ]
  ),
  pEmpty(),

  h3('Step 6 — Compose Signed File Name'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Action', 'Compose'],
      ['Inputs', "Signed_@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']}_@{utcNow('yyyyMMddHHmmss')}.pdf"],
      ['Output variable', "outputs('Compose_-_Signed_File_Name')"],
    ]
  ),
  pEmpty(),

  h3('Step 7 — Compose Storage Folder Path'),
  p('Build the full server-relative folder path for the signed PDF.'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Action', 'Compose'],
      ['Inputs', "/sites/[YourSite]/Shared Documents/Signed Documents/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']}/"],
      ['Output variable', "outputs('Compose_-_Storage_Folder_Path')"],
    ]
  ),
  noteBox("Replace /sites/[YourSite] with the actual site's server-relative URL. Ensure the folder structure exists in SharePoint before enabling the flow."),
  pEmpty(),

  h3('Step 8 — Create File in SharePoint (Signed Documents Library)'),
  p('Upload the signed PDF to the resolved folder in the Shared Documents/Signed Documents library.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Create file', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['Folder Path', "outputs('Compose_-_Storage_Folder_Path')", 'Step 7 output'],
      ['File Name', "outputs('Compose_-_Signed_File_Name')", 'Step 6 output'],
      ['File Content', "outputs('Get_document')?['body/$content']", 'Step 4 — signed PDF binary'],
    ]
  ),
  pEmpty(),

  h3('Step 9 — Update eSignature Item (Signed)'),
  p('Mark the eSignature record as Signed and record the completion timestamp and saved file path.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Update item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'eSignature', 'Static'],
      ['Id', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']", 'Step 5 — eSign item ID'],
      ['SignatureStatus', 'Signed', 'Static'],
      ['SignatureCompletedOn', 'utcNow()', 'Power Automate built-in'],
      ['SignedDocumentPath', "outputs('Create_file_-_Signed_Document')?['body/Path']", 'Step 8 — created file path'],
    ]
  ),
  pEmpty(),

  h3('Step 10 — Get DMS Documents Item'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Get item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'DMS Documents', 'Static'],
      ['Id', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']", 'Step 5 — eSignature.DocumentId'],
    ]
  ),
  pEmpty(),

  h3('Step 11 — Update DMS Documents Item (Status = Signed, IsEmailSend = true)'),
  p('Update the document status to Signed and set IsEmailSend = true to trigger Flow 3 to notify the Author and Approver.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Update item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'DMS Documents', 'Static'],
      ['Id', "outputs('Get_item')?['body/ID']", 'Step 10 — DMS Documents item ID'],
      ['Status', 'Signed', 'Static'],
      ['IsEmailSend', 'true', 'Static'],
    ]
  ),
  pEmpty(),

  h2('5.3  Storage Path Convention'),
  p('Signed documents are saved under the following path structure in the SharePoint Signed Documents library:'),
  pEmpty(),
  codeText('/Shared Documents/Signed Documents/[DocumentType]/[DrugName]/[CTDFolder]/'),
  pEmpty(),
  makeTable(
    ['Segment', 'Example Value', 'Source Column'],
    [
      ['DocumentType', 'eCTD / TMF / GMP', 'eSignature → DocumentType'],
      ['DrugName', 'Aspirin', 'eSignature → DrugName'],
      ['CTDFolder', 'Module 5 — Clinical', 'eSignature → CTDFolder'],
      ['Filename', 'Signed_Aspirin Module 5_20260318120000.pdf', 'Composed (Title + utcNow)'],
    ]
  ),
  pEmpty(),

  h2('6.4  Dynamic Value Map — Flow 2'),
  makeTable(
    ['Value Used', 'Expression', 'Source'],
    [
      ['Adobe Sign Agreement ID', "triggerOutputs()?['body/id']", 'Adobe Sign trigger'],
      ['Agreement status', "triggerOutputs()?['body/status']", 'Adobe Sign trigger'],
      ['Signed PDF binary', "outputs('Get_document')?['body/$content']", 'Adobe Sign Step 4'],
      ['eSign item ID', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']", 'eSignature list Step 5'],
      ['Document name (Title)', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']", 'eSignature → Title'],
      ['DocumentType', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']", 'eSignature → DocumentType'],
      ['DrugName', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']", 'eSignature → DrugName'],
      ['CTDFolder', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']", 'eSignature → CTDFolder'],
      ['DMS Documents ID', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']", 'eSignature → DocumentId'],
      ['UTC timestamp (filename)', "utcNow('yyyyMMddHHmmss')", 'Power Automate built-in'],
      ['Saved file path', "outputs('Create_file_-_Signed_Document')?['body/Path']", 'SharePoint Step 8 output'],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 5: FLOW 3 ───────────────────────────────────────────────────────
const section5 = [
  h1('6. Workflow 3 — DMS - Status Email Notification'),
  infoBox('Flow Name', 'DMS - Status Email Notification'),
  infoBox('Trigger', 'SharePoint — When an existing item is modified (DMS Documents list)'),
  infoBox('Purpose', 'Send correctly addressed Outlook emails for each status transition; reset IsEmailSend = false after sending'),
  pEmpty(),

  h2('6.1  Trigger & Condition'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Connector', 'SharePoint'],
      ['Action', 'When an existing item is modified'],
      ['Site Address', '[Your SharePoint Site URL]'],
      ['List Name', 'DMS Documents'],
    ]
  ),
  pEmpty(),
  h3('Condition — IsEmailSend = true?'),
  makeTable(
    ['Property', 'Value'],
    [
      ['Action', 'Condition'],
      ['Left value', "triggerOutputs()?['body/IsEmailSend']"],
      ['Operator', 'is equal to'],
      ['Right value', 'true'],
      ['If No', 'Terminate — modification was not a status-change event (e.g., manual edit)'],
    ]
  ),
  pEmpty(),

  h2('6.2  Switch Cases & Email Templates'),
  p('The Switch action inspects the document Status field and routes to one of six cases.'),
  pEmpty(),
  labelPara('Switch On', "triggerOutputs()?['body/Status']"),
  pEmpty(),

  h3('Case 1 — Status: "Pending Approval"'),
  p('Trigger event: Author submitted the document for Approver review.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Approver/Email']", 'DMS Documents → Approver (person)'],
      ['Subject', "Action Required: Document Pending Your Approval — @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Approver Display Name],'),
  codeText(''),
  codeText('A document has been submitted and is awaiting your approval in the Drug Management System (DMS).'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Author:          @{triggerOutputs()?['body/Author/DisplayName']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Submitted On:    @{triggerOutputs()?['body/Modified']}"),
  codeText(''),
  codeText('Please log in to the DMS portal to review and approve or reject the document.'),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h3('Case 2 — Status: "Approved"'),
  p('Trigger event: Approver cleared the document.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Author/Email']", 'DMS Documents → Author (person)'],
      ['Subject', "Your Document Has Been Approved — @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Author Display Name],'),
  codeText(''),
  codeText('Your document has been approved in the Drug Management System (DMS).'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Approved By:     @{triggerOutputs()?['body/Approver/DisplayName']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Approved On:     @{triggerOutputs()?['body/Modified']}"),
  codeText(''),
  codeText('The document is now ready to proceed to the e-signature stage.'),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h3('Case 3 — Status: "Rejected"'),
  p('Trigger event: Approver rejected the document. Comments included in body.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Author/Email']", 'DMS Documents → Author (person)'],
      ['Subject', "Document Rejected — Action Required: @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Author Display Name],'),
  codeText(''),
  codeText('Your document has been rejected in the Drug Management System (DMS).'),
  codeText('Please review the comments below and revise accordingly.'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Rejected By:     @{triggerOutputs()?['body/Approver/DisplayName']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Rejected On:     @{triggerOutputs()?['body/Modified']}"),
  codeText(''),
  codeText('Reviewer / Approver Comments:'),
  codeText("  @{triggerOutputs()?['body/Comments']}"),
  codeText(''),
  codeText('Please log in to the DMS portal to revise and resubmit the document.'),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h3('Case 4 — Status: "Pending for Signature"'),
  p('Trigger event: Signing process initiated — Adobe Sign agreement sent.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Reviewer/Email']", 'DMS Documents → Reviewer (Signer)'],
      ['CC', "triggerOutputs()?['body/Approver/Email']", 'DMS Documents → Approver'],
      ['Subject', "Action Required: E-Signature Requested — @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Reviewer Display Name],'),
  codeText(''),
  codeText('An e-signature has been requested for the following document in the Drug Management System (DMS).'),
  codeText('You will receive a separate email from Adobe Sign with the signing link.'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Initiated By:    @{triggerOutputs()?['body/Author/DisplayName']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Requested On:    @{triggerOutputs()?['body/Modified']}"),
  codeText(''),
  codeText('Please check your email for the Adobe Sign signing request and complete your signature'),
  codeText('at your earliest convenience.'),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h3('Case 5 — Status: "Signed"'),
  p('Trigger event: All signatories completed signing in Adobe Sign (set by Flow 2).'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Author/Email']", 'DMS Documents → Author'],
      ['CC', "triggerOutputs()?['body/Approver/Email']", 'DMS Documents → Approver'],
      ['Subject', "Document Signed Successfully — @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Author Display Name],'),
  codeText(''),
  codeText('All required signatures have been collected for the following document.'),
  codeText('The signed PDF has been automatically saved to the Signed Documents library.'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Signed On:       @{triggerOutputs()?['body/Modified']}"),
  codeText("  Signed By:       @{triggerOutputs()?['body/Reviewer/DisplayName']}"),
  codeText(''),
  codeText('The signed document has been automatically filed under:'),
  codeText("  Signed Documents / @{triggerOutputs()?['body/CTDFolder']}"),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h3('Case 6 — Status: "Final"'),
  p('Trigger event: Document fully finalized in the DMS.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['To', "triggerOutputs()?['body/Author/Email']", 'DMS Documents → Author'],
      ['CC', "@{triggerOutputs()?['body/Reviewer/Email']}; @{triggerOutputs()?['body/Approver/Email']}", 'DMS Documents → Reviewer + Approver'],
      ['Subject', "Document Finalized — @{triggerOutputs()?['body/Title']}", 'Dynamic'],
    ]
  ),
  pEmpty(),
  p('Email Body:', { bold: true }),
  codeText('Dear [Author Display Name],'),
  codeText(''),
  codeText('The following document has been finalized in the Drug Management System (DMS)'),
  codeText('and is now available in the Signed Documents library for reference.'),
  codeText(''),
  codeText('Document Details:'),
  codeText("  Document Name:   @{triggerOutputs()?['body/Title']}"),
  codeText("  Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}"),
  codeText("  CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}"),
  codeText("  Finalized On:    @{triggerOutputs()?['body/Modified']}"),
  codeText(''),
  codeText('No further action is required.'),
  codeText('The signed and finalized document has been filed in the DMS repository.'),
  codeText(''),
  codeText('Regards,'),
  codeText('Drug Management System — Automated Notification'),
  pEmpty(),

  h2('6.3  Reset Step — IsEmailSend = false'),
  p('This step runs AFTER the Switch, outside all Cases, as the final step in the Yes branch of the IsEmailSend condition.'),
  makeTable(
    ['Property', 'Value', 'Source'],
    [
      ['Connector', 'SharePoint', 'Static'],
      ['Action', 'Update item', 'Static'],
      ['Site Address', '[Your SharePoint Site URL]', 'Static'],
      ['List Name', 'DMS Documents', 'Static'],
      ['Id', "triggerOutputs()?['body/ID']", 'Trigger — DMS Documents item ID'],
      ['IsEmailSend', 'false', 'Static'],
    ]
  ),
  pEmpty(),

  h2('6.4  Dynamic Value Map — Flow 3'),
  makeTable(
    ['Value Used', 'Expression', 'Source Column'],
    [
      ['Email send flag', "triggerOutputs()?['body/IsEmailSend']", 'DMS Documents → IsEmailSend'],
      ['Document status', "triggerOutputs()?['body/Status']", 'DMS Documents → Status'],
      ['DMS Documents item ID', "triggerOutputs()?['body/ID']", 'DMS Documents → ID (auto)'],
      ['Document name', "triggerOutputs()?['body/Title']", 'DMS Documents → Title'],
      ['Author display name', "triggerOutputs()?['body/Author/DisplayName']", 'DMS Documents → Author'],
      ['Author email', "triggerOutputs()?['body/Author/Email']", 'DMS Documents → Author'],
      ['Reviewer display name', "triggerOutputs()?['body/Reviewer/DisplayName']", 'DMS Documents → Reviewer'],
      ['Reviewer email', "triggerOutputs()?['body/Reviewer/Email']", 'DMS Documents → Reviewer'],
      ['Approver display name', "triggerOutputs()?['body/Approver/DisplayName']", 'DMS Documents → Approver'],
      ['Approver email', "triggerOutputs()?['body/Approver/Email']", 'DMS Documents → Approver'],
      ['Drug / product name', "triggerOutputs()?['body/Drug/LookupValue']", 'DMS Documents → Drug (Lookup)'],
      ['CTD Folder', "triggerOutputs()?['body/CTDFolder']", 'DMS Documents → CTDFolder'],
      ['Comments', "triggerOutputs()?['body/Comments']", 'DMS Documents → Comments'],
      ['Last modified', "triggerOutputs()?['body/Modified']", 'DMS Documents → Modified (auto)'],
    ]
  ),
  pageBreak(),
];

// ─── SECTION 6: QUICK-REF ────────────────────────────────────────────────────
const section6 = [
  h1('7. Cross-Flow Dynamic Value Quick-Reference'),
  p('Use this section as a rapid lookup for any expression when building or debugging the flows.'),
  pEmpty(),
  h2('7.1  eSignature List Trigger Expressions (Flow 1)'),
  makeTable(
    ['Column', 'Expression'],
    [
      ['ID', "triggerOutputs()?['body/ID']"],
      ['Title', "triggerOutputs()?['body/Title']"],
      ['FilePath', "triggerOutputs()?['body/FilePath']"],
      ['FileName', "triggerOutputs()?['body/FileName']"],
      ['SignerEmail', "triggerOutputs()?['body/SignerEmail']"],
      ['ApproverEmail', "triggerOutputs()?['body/ApproverEmail']"],
      ['SignatureStatus', "triggerOutputs()?['body/SignatureStatus']"],
      ['DocumentId', "triggerOutputs()?['body/DocumentId']"],
      ['DocumentType', "triggerOutputs()?['body/DocumentType']"],
      ['DrugName', "triggerOutputs()?['body/DrugName']"],
      ['CTDFolder', "triggerOutputs()?['body/CTDFolder']"],
    ]
  ),
  pEmpty(),
  h2('7.2  Adobe Sign Trigger Expressions (Flow 2)'),
  makeTable(
    ['Field', 'Expression'],
    [
      ['Agreement ID', "triggerOutputs()?['body/id']"],
      ['Agreement Status', "triggerOutputs()?['body/status']"],
      ['Agreement Name', "triggerOutputs()?['body/name']"],
    ]
  ),
  pEmpty(),
  h2('7.3  DMS Documents Trigger Expressions (Flow 3)'),
  makeTable(
    ['Column', 'Expression'],
    [
      ['ID', "triggerOutputs()?['body/ID']"],
      ['Title', "triggerOutputs()?['body/Title']"],
      ['Status', "triggerOutputs()?['body/Status']"],
      ['IsEmailSend', "triggerOutputs()?['body/IsEmailSend']"],
      ['Author Email', "triggerOutputs()?['body/Author/Email']"],
      ['Author DisplayName', "triggerOutputs()?['body/Author/DisplayName']"],
      ['Reviewer Email', "triggerOutputs()?['body/Reviewer/Email']"],
      ['Reviewer DisplayName', "triggerOutputs()?['body/Reviewer/DisplayName']"],
      ['Approver Email', "triggerOutputs()?['body/Approver/Email']"],
      ['Approver DisplayName', "triggerOutputs()?['body/Approver/DisplayName']"],
      ['Drug LookupValue', "triggerOutputs()?['body/Drug/LookupValue']"],
      ['CTDFolder', "triggerOutputs()?['body/CTDFolder']"],
      ['Comments', "triggerOutputs()?['body/Comments']"],
      ['Modified', "triggerOutputs()?['body/Modified']"],
    ]
  ),
  pEmpty(),
  h2('7.4  Common Power Automate Utility Expressions'),
  makeTable(
    ['Purpose', 'Expression'],
    [
      ['Current UTC timestamp (full ISO)', 'utcNow()'],
      ['UTC timestamp for filename (sortable)', "utcNow('yyyyMMddHHmmss')"],
      ['First item from Get items result', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])"],
      ['Specific field from first item', "first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ColumnName']"],
      ['Created file path (after Create file)', "outputs('Create_file_-_Signed_Document')?['body/Path']"],
    ]
  ),
];

// ─── ASSEMBLE DOCUMENT ───────────────────────────────────────────────────────
const allChildren = [
  ...coverPage,
  ...tocSection,
  ...section1,
  ...section2,
  ...section3Lists,
  ...section3,
  ...section4,
  ...section5,
  ...section6,
];

const doc = new Document({
  numbering: {
    config: []
  },
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22, color: GREY },
        paragraph: { spacing: { line: 276 } }
      },
      heading1: {
        run: { font: 'Calibri', bold: true, color: BRAND, size: 34 },
        paragraph: { spacing: { before: 440, after: 180 } }
      },
      heading2: {
        run: { font: 'Calibri', bold: true, color: BRAND, size: 28 },
        paragraph: { spacing: { before: 320, after: 120 } }
      },
      heading3: {
        run: { font: 'Calibri', bold: true, color: ACCENT, size: 24 },
        paragraph: { spacing: { before: 240, after: 80 } }
      },
    }
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.2),
          right: convertInchesToTwip(1.2),
        }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { color: ACCENT, size: 6, style: BorderStyle.SINGLE, space: 4 } },
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'DMS Power Automate Flows — Technical Specification', size: 18, color: GREY })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { color: ACCENT, size: 6, style: BorderStyle.SINGLE, space: 4 } },
          children: [
            new TextRun({ text: 'Treta Infotech  |  DMS-PA-001  |  Page ', size: 18, color: GREY }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GREY }),
            new TextRun({ text: ' of ', size: 18, color: GREY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GREY }),
          ]
        })]
      })
    },
    children: allChildren,
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(outputDir, 'DMS-Power-Automate-Flows.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Word document generated:', outPath);
}).catch((err) => {
  console.error('Failed to generate Word document:', err);
  process.exit(1);
});
