
const path = require('path');

const SOPToolsPath = path.join(__dirname, '..', 'sop-tools', 'node_modules');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, PageBreak, NumberFormat, Footer, Header, PageNumber,
  LevelFormat, convertInchesToTwip, UnderlineType
} = require(path.join(SOPToolsPath, 'docx'));

const PptxGenJS = require(path.join(SOPToolsPath, 'pptxgenjs'));

const fs = require('fs');
const outputDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const flow1ImgPath = path.join(__dirname, '..', 'attached_assets', 'image_1773812754316.png');
const flow2ImgPath = path.join(__dirname, '..', 'attached_assets', 'image_1773812742510.png');

const flow1ImgData = fs.readFileSync(flow1ImgPath);
const flow2ImgData = fs.readFileSync(flow2ImgPath);

// ─── COLOURS ───────────────────────────────────────────────────────────────
const BRAND  = '1B2A4A';   // dark navy
const ACCENT = '1E88E5';   // blue
const LIGHT  = 'EBF2FC';   // light blue
const GREEN  = '2E7D32';
const ORANGE = 'E65100';
const PURPLE = '4527A0';
const GREY   = '666666';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const heading1 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 160 },
  border: { bottom: { color: ACCENT, size: 8, style: BorderStyle.SINGLE, space: 4 } },
  run: { color: BRAND, bold: true, size: 32 }
});

const heading2 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 120 },
  run: { color: BRAND, bold: true, size: 26 }
});

const heading3 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 80 },
  run: { color: ACCENT, bold: true, size: 24 }
});

const para = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 22, color: '333333', ...opts })]
});

const bullet = (text, level = 0) => new Paragraph({
  bullet: { level },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, size: 22, color: '333333' })]
});

const numbered = (text, level = 0) => new Paragraph({
  numbering: { reference: 'ordered', level },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, size: 22, color: '333333' })]
});

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const infoBox = (label, text) => new Paragraph({
  spacing: { before: 80, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT },
  children: [
    new TextRun({ text: label + ': ', bold: true, color: BRAND, size: 22 }),
    new TextRun({ text, size: 22, color: '333333' }),
  ]
});

const tableHeader = (cells) => new TableRow({
  tableHeader: true,
  children: cells.map(c => new TableCell({
    shading: { type: ShadingType.CLEAR, fill: BRAND },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: c, bold: true, color: 'FFFFFF', size: 20 })] })]
  }))
});

const tableRow2 = (cells, shade = false) => new TableRow({
  children: cells.map(c => new TableCell({
    shading: shade ? { type: ShadingType.CLEAR, fill: 'F9FAFC' } : {},
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, color: '333333' })] })]
  }))
});

const makeTable = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [tableHeader(headers), ...rows.map((r, i) => tableRow2(r, i % 2 === 1))]
});

const labeledPara = (label, text) => new Paragraph({
  spacing: { before: 60, after: 60 },
  children: [
    new TextRun({ text: label + ': ', bold: true, color: BRAND, size: 22 }),
    new TextRun({ text, size: 22, color: '333333' }),
  ]
});

// ─── DOCUMENT SECTIONS ──────────────────────────────────────────────────────
const titlePage = [
  new Paragraph({ spacing: { before: 1200, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STANDARD OPERATING PROCEDURE', bold: true, color: BRAND, size: 48 })] }),
  new Paragraph({ spacing: { before: 0, after: 160 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Drug Management System', bold: true, color: ACCENT, size: 40 })] }),
  new Paragraph({ spacing: { before: 0, after: 80 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SharePoint-Based Document Lifecycle & Electronic Signature Workflow', size: 26, color: GREY })] }),
  new Paragraph({ spacing: { before: 600, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Document No: SOP-DMS-001', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Version: 1.0', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Effective Date: March 2026', size: 22, color: GREY })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Prepared by: Treta Infotech', size: 22, color: GREY })] }),
  pageBreak(),
];

const tocSection = [
  heading1('Table of Contents'),
  para('1.  System Overview and Purpose', { bold: true }),
  para('2.  SharePoint List Setup and Choice Column Configuration'),
  para('3.  Screen-by-Screen Walkthrough'),
  para('    3.1  Add Document'),
  para('    3.2  Edit Document'),
  para('    3.3  View Document'),
  para('    3.4  CTD Folder Structure'),
  para('4.  Approve / Reject Workflow'),
  para('5.  User Group Roles and Permissions'),
  para('6.  Power Automate Flow 1 — Adobe Sign Implementation'),
  para('7.  Power Automate Flow 2 — Adobe Auto Save Signed Document'),
  para('8.  Troubleshooting and FAQ'),
  pageBreak(),
];

const section1 = [
  heading1('1. System Overview and Purpose'),
  para('The Drug Management System (DMS) is a SharePoint-based web application built using the SharePoint Framework (SPFx). It provides a centralised, controlled environment for managing pharmaceutical regulatory documents across their full lifecycle — from authoring through review, approval, and electronic signature.'),
  para(''),
  heading2('1.1  Business Objectives'),
  bullet('Provide a single source of truth for all regulatory and clinical documents.'),
  bullet('Enforce a structured review-and-approval workflow aligned with pharmaceutical quality standards.'),
  bullet('Integrate with Adobe Sign for tamper-evident electronic signatures.'),
  bullet('Restrict access to sensitive documents through SharePoint group-based permissions.'),
  bullet('Maintain a searchable, categorised CTD (Common Technical Document) folder hierarchy.'),
  para(''),
  heading2('1.2  Technology Stack'),
  makeTable(
    ['Component', 'Technology'],
    [
      ['Frontend Web Part', 'SharePoint Framework (SPFx) v1.20, React 17'],
      ['UI Library', 'Fluent UI / Office UI Fabric React'],
      ['Data Layer', 'PnPjs (SharePoint REST API)'],
      ['Automation', 'Microsoft Power Automate'],
      ['Electronic Signature', 'Adobe Sign (Acrobat Sign)'],
      ['State Management', 'Jotai'],
    ]
  ),
  para(''),
  heading2('1.3  Document Lifecycle'),
  para('A document in the DMS passes through the following states:'),
  bullet('Draft — Initial state when created by an Author.'),
  bullet('Under Review — Submitted to a Reviewer for feedback.'),
  bullet('Pending Approval — Forwarded to an Approver.'),
  bullet('Approved — Cleared by the Approver; eligible for eSignature.'),
  bullet('Rejected — Returned to the Author with comments.'),
  bullet('Signed — Electronically signed via Adobe Sign; PDF auto-saved to SharePoint.'),
  pageBreak(),
];

const section2 = [
  heading1('2. SharePoint List Setup and Choice Column Configuration'),
  para('The DMS is backed by several SharePoint lists. Administrators are responsible for keeping the choice-column data current to ensure that form drop-downs remain accurate.'),
  para(''),
  heading2('2.1  Key SharePoint Lists'),
  makeTable(
    ['List Name', 'Purpose', 'Primary Columns'],
    [
      ['Project Documents', 'Stores all document metadata', 'Title, Category, Status, Drug, Phase, Author, Approver, Version'],
      ['eSignature', 'Queues documents for Adobe Sign', 'Title, DocumentPath, Status, AgreementID'],
      ['Categories', 'Master list of document categories', 'Name, Group, DocumentCategory, Level, Status'],
      ['Drugs', 'Drug/compound master data', 'Name, GenericName, Indication, Phase, Status'],
      ['Templates', 'Reusable document templates', 'Name, MappingType, CTDFolder, Section, Country, Version'],
    ]
  ),
  para(''),
  heading2('2.2  Adding and Managing Choice Column Options'),
  para('Choice columns control the values available in drop-down menus throughout the application. To add or edit choices:'),
  numbered('Navigate to your SharePoint site and click the Settings gear icon → Site Contents.'),
  numbered('Locate the target list (e.g., "Project Documents") and click to open it.'),
  numbered('Click the Settings gear → List Settings.'),
  numbered('Under "Columns", click the column you wish to modify (e.g., "Category").'),
  numbered('In the "Type each choice on a separate line" text area, add, remove, or reorder values.'),
  numbered('Click OK to save. Changes take effect immediately in the DMS application.'),
  para(''),
  infoBox('Important', 'Removing a choice that is already used by existing items will leave those items with an invalid value. Always rename rather than delete choices when items already reference them.'),
  para(''),
  heading2('2.3  Status Column Values'),
  makeTable(
    ['Value', 'Meaning', 'Transitions To'],
    [
      ['Draft', 'Author is still working on the document', 'Under Review'],
      ['Under Review', 'Reviewer is providing feedback', 'Pending Approval, Draft'],
      ['Pending Approval', 'Approver is reviewing', 'Approved, Rejected'],
      ['Approved', 'Document cleared; sent to Adobe Sign', 'Signed'],
      ['Rejected', 'Returned to Author for revision', 'Draft'],
      ['Signed', 'Electronic signature captured', '—'],
    ]
  ),
  pageBreak(),
];

const section3 = [
  heading1('3. Screen-by-Screen Walkthrough'),
  heading2('3.1  Add Document'),
  para('The Add Document form allows authorized Authors to upload a new document and populate its metadata.'),
  para(''),
  heading3('Steps to Add a Document'),
  numbered('Log in to the SharePoint site hosting the DMS web part.'),
  numbered('On the Documents dashboard, click the "Add Document" (+ Add) button in the toolbar.'),
  numbered('The Add Document panel slides in from the right side of the screen.'),
  numbered('Complete all required fields marked with an asterisk (*):'),
  bullet('Document Title — Enter a descriptive name (e.g., "Aspirin Module 2 Clinical Study").', 1),
  bullet('Category — Select from the configured choice column (e.g., Clinical, Quality, Nonclinical).', 1),
  bullet('Drug / Compound — Select from the Drugs master list.', 1),
  bullet('Phase — Select the development phase (e.g., Phase I, Phase III, Marketed).', 1),
  bullet('Version — Enter the document version number (e.g., 1.0).', 1),
  bullet('Upload File — Click "Browse" and select the .docx, .pdf, or .xlsx file from your computer.', 1),
  numbered('Click "Save" to create the list item and upload the file to the "Shared Documents/Project Documents" library.'),
  numbered('A success toast notification confirms that the document was added.'),
  para(''),
  infoBox('Note', 'Only users in the Author or Admin SharePoint groups can access the Add Document button. Users in the User group have read-only access.'),
  para(''),
  heading2('3.2  Edit Document'),
  para('Authors and Administrators may update document metadata at any time (except when a document is in "Pending Approval" or "Signed" state).'),
  numbered('In the Documents list, locate the document you wish to edit.'),
  numbered('Click the pencil (Edit) icon in the Actions column.'),
  numbered('The Edit Document panel opens with all current values pre-populated.'),
  numbered('Modify the required fields.'),
  numbered('To replace the attached file, click "Replace File" and upload the new version.'),
  numbered('Click "Save" to commit the changes. The version field should be incremented manually.'),
  para(''),
  heading2('3.3  View Document'),
  para('Any authenticated user may view document metadata. Only authorized users may open the file.'),
  numbered('Click the eye (View) icon next to any document in the list.'),
  numbered('The View Document panel opens showing all metadata fields in read-only mode.'),
  numbered('Click "Open Document" to open the file in the browser or download it.'),
  numbered('Click "X" or click outside the panel to close.'),
  para(''),
  heading2('3.4  CTD Folder Structure'),
  para('The CTD (Common Technical Document) view presents documents in an eCTD-compliant module hierarchy.'),
  makeTable(
    ['Module', 'Section', 'Description'],
    [
      ['Module 1', '1.1, 1.2', 'Administrative — Comprehensive TOC, Investigator Brochure'],
      ['Module 2', '2.4, 2.5', 'Summaries — Nonclinical & Clinical Overviews'],
      ['Module 3', '3.2.A, 3.2.P', 'Quality — Facilities & Drug Product'],
      ['Module 4', '4.2.1, 4.2.2', 'Nonclinical — Pharmacology & Toxicology'],
      ['Module 5', '5.3.1, 5.3.5', 'Clinical — Study Reports & Efficacy Reports'],
    ]
  ),
  para('To navigate the CTD view, click on any module in the tree panel on the left. The right pane displays documents belonging to that section. Clicking a document opens the View Document panel.'),
  pageBreak(),
];

const section4 = [
  heading1('4. Approve / Reject Workflow'),
  para('The DMS enforces a structured multi-stage workflow to ensure quality oversight before a document is signed.'),
  para(''),
  heading2('4.1  Workflow Stages'),
  makeTable(
    ['Stage', 'Actor', 'Actions Available'],
    [
      ['Draft', 'Author', 'Edit, Submit for Review, Delete'],
      ['Under Review', 'Reviewer', 'Provide comments, Forward to Approver, Return to Author'],
      ['Pending Approval', 'Approver', 'Approve, Reject with comments'],
      ['Approved', 'System / Admin', 'Trigger Adobe Sign via eSignature list'],
      ['Rejected', 'Author', 'View rejection comments, Edit, Resubmit'],
      ['Signed', 'Read-only', 'View, Download signed PDF'],
    ]
  ),
  para(''),
  heading2('4.2  Approver Steps — Approving a Document'),
  numbered('Log in as a user in the Approver SharePoint group.'),
  numbered('Navigate to the "Pending Approval" tab on the dashboard or filter the document list by Status = "Pending Approval".'),
  numbered('Click the eye icon to open the document and review its content.'),
  numbered('Click "Approve" in the action panel.'),
  numbered('Optionally add an approval comment.'),
  numbered('Confirm the action. The document status updates to "Approved".'),
  numbered('The system (or Admin) then adds an entry to the eSignature list to trigger Adobe Sign.'),
  para(''),
  heading2('4.3  Approver Steps — Rejecting a Document'),
  numbered('Open the document from the "Pending Approval" list.'),
  numbered('Click "Reject".'),
  numbered('Enter mandatory rejection comments explaining the reason.'),
  numbered('Confirm the action. The status reverts to "Rejected" and the Author is notified.'),
  numbered('The Author should review the comments, revise the document, and resubmit.'),
  pageBreak(),
];

const section5 = [
  heading1('5. User Group Roles and Permissions'),
  para('Access to DMS features is controlled by three SharePoint Groups. Group membership is managed by the SharePoint Site Administrator.'),
  para(''),
  heading2('5.1  Group Overview'),
  makeTable(
    ['Group Name', 'SharePoint Permission Level', 'DMS Role'],
    [
      ['DMS-Admin', 'Full Control', 'Administrator'],
      ['DMS-HR', 'Contribute', 'HR / Author'],
      ['DMS-User', 'Read', 'Read-Only User'],
    ]
  ),
  para(''),
  heading2('5.2  Administrator (DMS-Admin)'),
  para('Administrators have unrestricted access across the entire system.'),
  bullet('Manage list choice-column data (Category, Status, Phase, etc.).'),
  bullet('Add, edit, and delete any document regardless of status.'),
  bullet('Manage user group membership via SharePoint.'),
  bullet('Configure site settings, columns, and views.'),
  bullet('Trigger eSignature workflows and view all Power Automate flow run history.'),
  bullet('Access all SharePoint library contents including Signed Documents.'),
  para(''),
  heading2('5.3  HR / Author (DMS-HR)'),
  para('HR users can create and manage documents they own.'),
  bullet('Add new documents and upload files.'),
  bullet('Edit documents they authored (when in Draft or Rejected state).'),
  bullet('Submit documents for review.'),
  bullet('View all documents in the list (read-only for others).'),
  bullet('Cannot approve, reject, or modify choice-column metadata.'),
  para(''),
  heading2('5.4  User (DMS-User)'),
  para('Standard users have view-only access.'),
  bullet('Browse and search the document list.'),
  bullet('View document metadata panels.'),
  bullet('Open and download approved documents (subject to file-level permissions).'),
  bullet('Cannot add, edit, delete, approve, or reject documents.'),
  para(''),
  heading2('5.5  Managing Group Membership'),
  numbered('Navigate to your SharePoint site → Settings → Site Permissions.'),
  numbered('Click the group you wish to manage (e.g., DMS-HR).'),
  numbered('Click "New" → "Add Users" and enter the user\'s email address.'),
  numbered('Click "Share" to confirm. The user gains DMS access within minutes.'),
  pageBreak(),
];

const section6 = [
  heading1('6. Power Automate Flow 1 — Adobe Sign Implementation'),
  para('This flow sends a document for electronic signature via Adobe Sign (Acrobat Sign) whenever a new item is created in the eSignature SharePoint list.'),
  para(''),
  heading2('6.1  Flow Overview'),
  infoBox('Flow Name', 'Adobe Sign Implementation'),
  infoBox('Trigger', 'When an item is created in the eSignature SharePoint list'),
  infoBox('Environment', 'Treta Infotech Private Limited — Power Automate'),
  para(''),
  heading2('6.2  Step-by-Step Flow Description'),
  heading3('Step 1: Trigger — When an item is created'),
  para('The flow is triggered automatically when a new item is added to the eSignature SharePoint list.'),
  labeledPara('Site Address', 'https://treta.sharepoint.com/sites/ReddApps/KrunalData'),
  labeledPara('List Name', 'eSignature'),
  para(''),
  heading3('Step 2: Get file content using path'),
  para('Retrieves the binary content of the document file stored in the SharePoint document library.'),
  labeledPara('Site Address', 'https://treta.sharepoint.com/sites/ReddApps/KrunalData'),
  labeledPara('File Path', '/Shared Documents/Surbhi-Godhani-20242411101242.docx (dynamic — uses list item file path)'),
  para(''),
  heading3('Step 3: Create an agreement and send for signature'),
  para('This is the core step that calls the Adobe Sign connector.'),
  makeTable(
    ['Field', 'Value'],
    [
      ['Agreement Name', 'Title (from the eSignature list item)'],
      ['File Name 1', 'Dynamic filename from the list item'],
      ['File Content 1', 'Body (file binary from Step 2)'],
      ['Signature Type', 'ESIGN'],
      ['Participant Member 1 (Email)', 'surbhi.godhan@tretainfotech.com'],
      ['Participant Order 1', '1'],
      ['Participant Role 1', 'APPROVER'],
      ['Participant Member 2 (Email)', 'surbhi.godhan@tretainfotech.com'],
      ['Participant Order 2', '2'],
      ['Participant Role 2', 'SIGNER'],
    ]
  ),
  para(''),
  infoBox('Participant Roles', 'The APPROVER (Order 1) reviews the document first. After approval, the SIGNER (Order 2) applies the electronic signature. Both steps are sequential.'),
  para(''),
  heading2('6.3  Connector Setup'),
  numbered('In Power Automate, click "Connections" in the left navigation.'),
  numbered('Click "+ New connection" and search for "Adobe Acrobat Sign".'),
  numbered('Sign in with the Adobe Sign account credentials supplied by your administrator.'),
  numbered('Confirm the connection. It will appear in the connections list as "Adobe Acrobat Sign".'),
  numbered('Return to the flow and ensure the "Create an agreement" step uses this connection.'),
  para(''),
  new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text: 'Flow Diagram — Adobe Sign Implementation', bold: true, color: BRAND, size: 24 })]
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new ImageRun({
        data: flow1ImgData,
        transformation: { width: 500, height: 670 },
      })
    ]
  }),
  pageBreak(),
];

const section7 = [
  heading1('7. Power Automate Flow 2 — Adobe Auto Save Signed Document'),
  para('This flow monitors Adobe Sign for agreements that reach the SIGNED state and automatically saves the completed PDF to a designated SharePoint library.'),
  para(''),
  heading2('7.1  Flow Overview'),
  infoBox('Flow Name', 'Adobe Auto Save Signed Document'),
  infoBox('Trigger', 'When the state of an agreement changes (Adobe Sign connector)'),
  infoBox('Environment', 'Treta Infotech Private Limited — Power Automate'),
  para(''),
  heading2('7.2  Step-by-Step Flow Description'),
  heading3('Step 1: Trigger — When the state of an agreement changes'),
  para('The Adobe Sign connector polls for agreement state changes.'),
  labeledPara('Name', 'Get Signed document'),
  labeledPara('Scope', 'Any agreement in my account'),
  labeledPara('Events', 'When a participant completes their action'),
  para(''),
  heading3('Step 2: Compose'),
  para('Extracts the agreement.id dynamic value from the trigger output for use in downstream steps.'),
  labeledPara('Inputs', 'agreement.id (dynamic value from trigger)'),
  para(''),
  heading3('Step 3: Initialize variable'),
  para('Stores the agreement status in a string variable for use in the condition.'),
  labeledPara('Name', 'AgreementStatus'),
  labeledPara('Type', 'String'),
  labeledPara('Value', 'agreement.status (dynamic value from trigger)'),
  para(''),
  heading3('Step 4: Condition — Check if agreement is SIGNED'),
  para('Evaluates whether the AgreementStatus variable equals "SIGNED".'),
  bullet('If Yes → proceed to retrieve and save the signed PDF.'),
  bullet('If No → do nothing (empty branch).'),
  para(''),
  heading3('Step 5 (If Yes): Get Signed Document'),
  para('Calls the Adobe Sign "Get a PDF of a signed agreement" action.'),
  labeledPara('Agreement ID', 'agreement.id (from Compose step)'),
  para(''),
  heading3('Step 6 (If Yes): Create file in SharePoint'),
  para('Saves the signed PDF to the SharePoint Shared Documents library.'),
  makeTable(
    ['Field', 'Value'],
    [
      ['Site Address', 'https://treta.sharepoint.com/sites/ReddApps/KrunalData (Krunal\'s Data)'],
      ['Folder Path', '/Shared Documents/Signed Document'],
      ['File Name', 'Signed_[agreement.name]_[utcNow()].pdf'],
      ['File Content', 'Body (PDF binary from Get Signed Document step)'],
    ]
  ),
  para(''),
  infoBox('Folder', 'Ensure the "Signed Document" folder exists in the "Shared Documents" library before enabling the flow. The flow will fail if the folder is missing.'),
  para(''),
  heading2('7.3  Connector Setup'),
  numbered('In Power Automate, open Connections and verify that the "Adobe Acrobat Sign" connection is active (established in Flow 1 setup).'),
  numbered('Also verify the "SharePoint" connection is present and authenticated with an account that has Contribute rights to the target site.'),
  numbered('Open the flow and confirm each action references the correct connection.'),
  numbered('Click "Save" and then "Test" → "Manually" to validate the end-to-end process.'),
  para(''),
  new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text: 'Flow Diagram — Adobe Auto Save Signed Document', bold: true, color: BRAND, size: 24 })]
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new ImageRun({
        data: flow2ImgData,
        transformation: { width: 500, height: 750 },
      })
    ]
  }),
  pageBreak(),
];

const section8 = [
  heading1('8. Troubleshooting and FAQ'),
  makeTable(
    ['Issue', 'Likely Cause', 'Resolution'],
    [
      ['Cannot see the "Add Document" button', 'User is in DMS-User group (read-only)', 'Request Admin to move you to DMS-HR group'],
      ['Document status is stuck on "Pending Approval"', 'Approver has not acted', 'Contact the assigned Approver or Admin'],
      ['Adobe Sign email not received', 'Adobe Sign connector uses wrong email', 'Check Participant Member email in Flow 1'],
      ['Signed PDF not saved to SharePoint', '"Signed Document" folder does not exist', 'Create the folder in Shared Documents library'],
      ['Flow fails with "Unauthorized"', 'Adobe Sign connection has expired', 'Re-authenticate the Adobe Sign connection in Power Automate'],
      ['Choice column value missing from dropdown', 'Value not added to column settings', 'Admin must add the value via List Settings → Column'],
    ]
  ),
  para(''),
  para('For further assistance, contact your SharePoint Administrator or Power Platform support team.'),
];

// ─── ASSEMBLE DOCUMENT ──────────────────────────────────────────────────────
async function generateWord() {
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'ordered',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } }]
      }]
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: '333333' } }
      },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', run: { color: BRAND, bold: true, size: 32, font: 'Calibri' }, paragraph: { spacing: { before: 400, after: 160 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { color: BRAND, bold: true, size: 26, font: 'Calibri' }, paragraph: { spacing: { before: 320, after: 120 } } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', run: { color: ACCENT, bold: true, size: 24, font: 'Calibri' }, paragraph: { spacing: { before: 240, after: 80 } } },
      ]
    },
    sections: [{
      properties: {},
      children: [
        ...titlePage,
        ...tocSection,
        ...section1,
        ...section2,
        ...section3,
        ...section4,
        ...section5,
        ...section6,
        ...section7,
        ...section8,
      ]
    }]
  });

  const buf = await Packer.toBuffer(doc);
  const outPath = path.join(outputDir, 'DMS-SOP.docx');
  fs.writeFileSync(outPath, buf);
  console.log('Word document generated:', outPath);
}

// ─── POWERPOINT ─────────────────────────────────────────────────────────────
async function generatePPT() {
  const pptx = new PptxGenJS();

  pptx.defineLayout({ name: 'LAYOUT_WIDE', width: 13.33, height: 7.5 });
  pptx.layout = 'LAYOUT_WIDE';

  const TITLE_COLOR = '1B2A4A';
  const BODY_COLOR  = '333333';
  const ACC_COLOR   = '1E88E5';
  const BG_SLIDE    = 'F4F6FB';

  const titleOpts = { color: TITLE_COLOR, fontFace: 'Calibri', fontSize: 28, bold: true };
  const bodyOpts  = { color: BODY_COLOR,  fontFace: 'Calibri', fontSize: 14 };
  const bullet16  = { color: BODY_COLOR,  fontFace: 'Calibri', fontSize: 14, bullet: { type: 'bullet' } };

  function addSlide(title, isTitle = false) {
    const slide = pptx.addSlide();
    slide.background = { color: isTitle ? TITLE_COLOR : BG_SLIDE };

    if (isTitle) {
      slide.addText(title, { x: 1, y: 2.5, w: 11.33, h: 1.2, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
    } else {
      // Header bar
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.8, fill: { color: TITLE_COLOR } });
      slide.addText(title, { x: 0.3, y: 0, w: 12.73, h: 0.8, fontSize: 22, bold: true, color: 'FFFFFF', fontFace: 'Calibri', valign: 'middle' });
      // Footer
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.1, w: 13.33, h: 0.4, fill: { color: '1E88E5' } });
      slide.addText('Drug Management System — SOP-DMS-001 | Version 1.0 | March 2026', { x: 0.3, y: 7.1, w: 12.73, h: 0.4, fontSize: 9, color: 'FFFFFF', fontFace: 'Calibri', valign: 'middle' });
    }
    return slide;
  }

  // Slide 1 — Title
  const s1 = pptx.addSlide();
  s1.background = { color: TITLE_COLOR };
  s1.addText('STANDARD OPERATING PROCEDURE', { x: 0.5, y: 1.8, w: 12.33, h: 0.8, fontSize: 32, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  s1.addText('Drug Management System', { x: 0.5, y: 2.7, w: 12.33, h: 0.7, fontSize: 28, bold: false, color: '90CAF9', fontFace: 'Calibri', align: 'center' });
  s1.addText('SharePoint-Based Document Lifecycle & Electronic Signature Workflow', { x: 0.5, y: 3.5, w: 12.33, h: 0.5, fontSize: 16, color: 'BBDEFB', fontFace: 'Calibri', align: 'center' });
  s1.addText('SOP-DMS-001  |  Version 1.0  |  March 2026  |  Treta Infotech', { x: 0.5, y: 6.5, w: 12.33, h: 0.4, fontSize: 11, color: '90CAF9', fontFace: 'Calibri', align: 'center' });

  // Slide 2 — Agenda
  const s2 = addSlide('Agenda');
  const agenda = [
    '1.  System Overview & Purpose',
    '2.  SharePoint List Setup & Choice Column Configuration',
    '3.  Screen-by-Screen Walkthrough (Add, Edit, View, CTD)',
    '4.  Approve / Reject Workflow',
    '5.  User Group Roles & Permissions (Admin, HR, User)',
    '6.  Power Automate Flow 1 — Adobe Sign Implementation',
    '7.  Power Automate Flow 2 — Adobe Auto Save Signed Document',
    '8.  Troubleshooting & FAQ',
  ];
  s2.addText(agenda.map(a => ({ text: a, options: { bullet: false, breakLine: true } })), { x: 0.5, y: 1.1, w: 12.33, h: 5.8, fontSize: 16, color: BODY_COLOR, fontFace: 'Calibri', valign: 'top' });

  // Slide 3 — System Overview
  const s3 = addSlide('1. System Overview & Purpose');
  s3.addText([
    { text: 'What is the Drug Management System?\n', options: { bold: true, color: TITLE_COLOR } },
    { text: 'A SharePoint SPFx web application for managing pharmaceutical regulatory documents through their full lifecycle.\n\n', options: { color: BODY_COLOR } },
    { text: 'Business Objectives\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '• Single source of truth for regulatory & clinical documents\n• Structured review-and-approval workflow\n• Adobe Sign integration for electronic signatures\n• Role-based access via SharePoint Groups\n• eCTD-aligned CTD folder hierarchy', options: { color: BODY_COLOR } },
  ], { x: 0.5, y: 1.0, w: 12.33, h: 5.8, fontSize: 14, fontFace: 'Calibri', valign: 'top' });

  // Slide 4 — Technology Stack
  const s4 = addSlide('1. Technology Stack');
  const stackRows = [
    ['Frontend', 'SPFx v1.20, React 17, Fluent UI'],
    ['Data Layer', 'PnPjs (SharePoint REST API)'],
    ['Automation', 'Microsoft Power Automate'],
    ['eSignature', 'Adobe Sign (Acrobat Sign)'],
    ['State Mgmt', 'Jotai'],
  ];
  const tblStack = stackRows.map(r => [
    { text: r[0], options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
    { text: r[1], options: { color: BODY_COLOR } },
  ]);
  s4.addTable(tblStack, { x: 0.5, y: 1.1, w: 12.33, fontSize: 14, fontFace: 'Calibri', colW: [2.5, 9.83], border: { pt: 1, color: 'DDDDDD' } });

  // Slide 5 — Document Lifecycle
  const s5 = addSlide('1. Document Lifecycle');
  const states = ['Draft', 'Under Review', 'Pending Approval', 'Approved', 'Signed'];
  const stateColors = ['EEEEEE', 'FFF3E0', 'E3F2FD', 'E8F5E9', 'F3E5F5'];
  const stateTxt   = ['333333', 'E65100', '1565C0', '2E7D32', '7B1FA2'];
  states.forEach((st, i) => {
    const x = 0.5 + i * 2.5;
    s5.addShape(pptx.ShapeType.roundRect, { x, y: 2.2, w: 2.1, h: 0.9, fill: { color: stateColors[i] }, line: { color: stateTxt[i], pt: 2 } });
    s5.addText(st, { x, y: 2.2, w: 2.1, h: 0.9, fontSize: 13, bold: true, color: stateTxt[i], fontFace: 'Calibri', align: 'center', valign: 'middle' });
    if (i < states.length - 1) {
      s5.addShape(pptx.ShapeType.rightArrow, { x: x + 2.1, y: 2.45, w: 0.4, h: 0.4, fill: { color: ACC_COLOR } });
    }
  });
  s5.addText('Draft → Under Review → Pending Approval → Approved → Signed', { x: 0.5, y: 3.4, w: 12.33, h: 0.4, fontSize: 12, color: '888888', fontFace: 'Calibri', align: 'center', italic: true });
  s5.addText('Rejected documents return to Draft for revision.', { x: 0.5, y: 4.0, w: 12.33, h: 0.4, fontSize: 13, color: 'D32F2F', fontFace: 'Calibri', align: 'center' });

  // Slide 6 — SharePoint Lists
  const s6 = addSlide('2. SharePoint List Setup');
  s6.addText([
    { text: 'Key Lists\n\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '• Project Documents — document metadata\n• eSignature — queues docs for Adobe Sign\n• Categories — master category list\n• Drugs — compound master data\n• Templates — reusable document templates\n\n', options: { color: BODY_COLOR } },
  ], { x: 0.5, y: 1.0, w: 6.0, h: 5.8, fontSize: 14, fontFace: 'Calibri', valign: 'top' });
  s6.addText([
    { text: 'Updating Choice Columns\n\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '1. Settings gear → Site Contents\n2. Open target list → List Settings\n3. Click the column (e.g. "Category")\n4. Add/remove values in the text area\n5. Click OK — changes are immediate', options: { color: BODY_COLOR } },
  ], { x: 6.8, y: 1.0, w: 6.0, h: 5.8, fontSize: 14, fontFace: 'Calibri', valign: 'top' });

  // Slide 7 — Add Document
  const s7 = addSlide('3. Add Document — Step by Step');
  s7.addText([
    { text: '1. Click "+ Add Document" in the toolbar\n', options: {} },
    { text: '2. Fill required fields: Title, Category, Drug, Phase, Version\n', options: {} },
    { text: '3. Upload the file (.docx / .pdf / .xlsx)\n', options: {} },
    { text: '4. Click Save — success toast confirms upload\n\n', options: {} },
    { text: 'Tip: ', options: { bold: true, color: TITLE_COLOR } },
    { text: 'Only Admin and HR group members can add documents.', options: { color: BODY_COLOR, italic: true } },
  ], { x: 0.5, y: 1.0, w: 12.33, h: 5.8, fontSize: 15, color: BODY_COLOR, fontFace: 'Calibri', valign: 'top' });

  // Slide 8 — Edit & View
  const s8 = addSlide('3. Edit & View Document');
  s8.addText([
    { text: 'Edit Document\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '• Click the pencil icon in the Actions column\n• Edit panel opens with current values pre-filled\n• Replace file if needed; increment version manually\n• Save to commit changes\n\n', options: { color: BODY_COLOR } },
    { text: 'View Document\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '• Click the eye icon on any document\n• Read-only metadata panel opens\n• Click "Open Document" to open or download the file', options: { color: BODY_COLOR } },
  ], { x: 0.5, y: 1.0, w: 12.33, h: 5.8, fontSize: 14, fontFace: 'Calibri', valign: 'top' });

  // Slide 9 — CTD Folder Structure
  const s9 = addSlide('3. CTD Folder Structure');
  const ctdRows = [
    ['Module 1', 'Administrative', '1.1, 1.2'],
    ['Module 2', 'Summaries', '2.4, 2.5'],
    ['Module 3', 'Quality', '3.2.A, 3.2.P'],
    ['Module 4', 'Nonclinical', '4.2.1, 4.2.2'],
    ['Module 5', 'Clinical', '5.3.1, 5.3.5'],
  ];
  const ctdTable = [
    [{ text: 'Module', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Category', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Sections', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...ctdRows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s9.addTable(ctdTable, { x: 0.5, y: 1.1, w: 12.33, fontSize: 14, fontFace: 'Calibri', border: { pt: 1, color: 'DDDDDD' } });
  s9.addText('Navigate the CTD tree (left panel) to filter documents by module and section.', { x: 0.5, y: 5.9, w: 12.33, h: 0.4, fontSize: 13, color: '888888', fontFace: 'Calibri', align: 'center', italic: true });

  // Slide 10 — Approve/Reject Workflow
  const s10 = addSlide('4. Approve / Reject Workflow');
  const wfRows = [
    ['Pending Approval', 'Approver', 'Approve or Reject'],
    ['Approved', 'System', 'Trigger eSignature'],
    ['Rejected', 'Author', 'Review comments, Revise, Resubmit'],
  ];
  const wfTable = [
    [{ text: 'Stage', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Actor', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Actions', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...wfRows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s10.addTable(wfTable, { x: 0.5, y: 1.1, w: 12.33, fontSize: 14, fontFace: 'Calibri', border: { pt: 1, color: 'DDDDDD' } });
  s10.addText([
    { text: 'Approving: ', options: { bold: true } },
    { text: 'Open document → Review content → Click Approve → Add optional comment → Confirm.\n', options: {} },
    { text: 'Rejecting: ', options: { bold: true } },
    { text: 'Open document → Click Reject → Enter mandatory reason → Confirm.', options: {} },
  ], { x: 0.5, y: 4.1, w: 12.33, h: 2.5, fontSize: 13, color: BODY_COLOR, fontFace: 'Calibri', valign: 'top' });

  // Slide 11 — User Groups
  const s11 = addSlide('5. User Group Roles & Permissions');
  const groupRows = [
    ['DMS-Admin', 'Full Control', 'Add/edit/delete all docs, manage lists, trigger flows, manage groups'],
    ['DMS-HR', 'Contribute', 'Add/edit own docs, submit for review, view all docs'],
    ['DMS-User', 'Read', 'Browse, search, view and download approved documents only'],
  ];
  const groupTable = [
    [{ text: 'Group', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'SharePoint Level', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Permissions', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...groupRows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s11.addTable(groupTable, { x: 0.5, y: 1.1, w: 12.33, fontSize: 13, fontFace: 'Calibri', colW: [2, 2.5, 7.83], border: { pt: 1, color: 'DDDDDD' } });
  s11.addText('To add a user: Site Settings → Site Permissions → [Group] → New → Add Users → enter email → Share.', { x: 0.5, y: 5.9, w: 12.33, h: 0.5, fontSize: 12, color: '888888', fontFace: 'Calibri', italic: true });

  // Slide 12 — Flow 1 Overview
  const s12 = addSlide('6. Flow 1 — Adobe Sign Implementation');
  s12.addText([
    { text: 'Trigger: ', options: { bold: true, color: TITLE_COLOR } },
    { text: 'New item created in the eSignature SharePoint list\n\n', options: {} },
    { text: 'Steps:\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '1. Trigger — item created in eSignature list\n', options: {} },
    { text: '2. Get file content using path from SharePoint\n', options: {} },
    { text: '3. Create agreement & send for signature (Adobe Sign)\n', options: {} },
    { text: '   • Participant 1: APPROVER (reviews document)\n', options: {} },
    { text: '   • Participant 2: SIGNER (applies e-signature)\n\n', options: {} },
    { text: 'Setup: ', options: { bold: true, color: TITLE_COLOR } },
    { text: 'Power Automate → Connections → + New → Adobe Acrobat Sign → Sign in.', options: {} },
  ], { x: 0.5, y: 1.0, w: 6.5, h: 5.8, fontSize: 13, color: BODY_COLOR, fontFace: 'Calibri', valign: 'top' });
  s12.addImage({ data: 'image/png;base64,' + flow1ImgData.toString('base64'), x: 7.2, y: 0.9, w: 5.8, h: 5.5, sizing: { type: 'contain', w: 5.8, h: 5.5 } });

  // Slide 13 — Flow 1 Config
  const s13 = addSlide('6. Flow 1 — Agreement Configuration');
  const f1Rows = [
    ['Agreement Name', 'Title (from eSignature list item)'],
    ['File Name', 'Dynamic filename from list item'],
    ['Signature Type', 'ESIGN'],
    ['Participant 1 Role', 'APPROVER (Order 1)'],
    ['Participant 2 Role', 'SIGNER (Order 2)'],
    ['Participant Email', 'surbhi.godhan@tretainfotech.com'],
  ];
  const f1Table = [
    [{ text: 'Field', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...f1Rows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s13.addTable(f1Table, { x: 0.5, y: 1.1, w: 12.33, fontSize: 13, fontFace: 'Calibri', border: { pt: 1, color: 'DDDDDD' } });

  // Slide 14 — Flow 2 Overview
  const s14 = addSlide('7. Flow 2 — Adobe Auto Save Signed Document');
  s14.addText([
    { text: 'Trigger: ', options: { bold: true, color: TITLE_COLOR } },
    { text: 'When the state of an Adobe Sign agreement changes\n\n', options: {} },
    { text: 'Steps:\n', options: { bold: true, color: TITLE_COLOR } },
    { text: '1. Trigger — agreement state change\n', options: {} },
    { text: '2. Compose — extract agreement.id\n', options: {} },
    { text: '3. Initialize variable — store AgreementStatus\n', options: {} },
    { text: '4. Condition — if AgreementStatus = "SIGNED"\n', options: {} },
    { text: '5. (If Yes) Get PDF of signed agreement\n', options: {} },
    { text: '6. (If Yes) Create file in SharePoint\n', options: {} },
    { text: '   Folder: /Shared Documents/Signed Document\n', options: {} },
    { text: '   Name: Signed_[agreement.name]_[utcNow()].pdf', options: {} },
  ], { x: 0.5, y: 1.0, w: 6.5, h: 5.8, fontSize: 13, color: BODY_COLOR, fontFace: 'Calibri', valign: 'top' });
  s14.addImage({ data: 'image/png;base64,' + flow2ImgData.toString('base64'), x: 7.2, y: 0.9, w: 5.8, h: 5.5, sizing: { type: 'contain', w: 5.8, h: 5.5 } });

  // Slide 15 — Flow 2 Config
  const s15 = addSlide('7. Flow 2 — SharePoint File Configuration');
  const f2Rows = [
    ['Site Address', 'https://treta.sharepoint.com/sites/ReddApps/KrunalData'],
    ['Folder Path', '/Shared Documents/Signed Document'],
    ['File Name', 'Signed_[agreement.name]_[utcNow()].pdf'],
    ['File Content', 'Body (PDF binary from Get Signed Document)'],
    ['Prerequisite', '"Signed Document" folder must exist in Shared Documents'],
  ];
  const f2Table = [
    [{ text: 'Field', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...f2Rows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s15.addTable(f2Table, { x: 0.5, y: 1.1, w: 12.33, fontSize: 12, fontFace: 'Calibri', border: { pt: 1, color: 'DDDDDD' } });

  // Slide 16 — Troubleshooting
  const s16 = addSlide('8. Troubleshooting & FAQ');
  const faqRows = [
    ['No "Add Document" button', 'Move user to DMS-HR group'],
    ['Doc stuck on Pending Approval', 'Contact Approver or Admin'],
    ['Adobe Sign email not received', 'Check Participant email in Flow 1'],
    ['Signed PDF not saved', 'Create "Signed Document" folder in Shared Docs'],
    ['Flow — Unauthorized error', 'Re-authenticate Adobe Sign connection'],
    ['Choice missing from dropdown', 'Admin adds value via List Settings → Column'],
  ];
  const faqTable = [
    [{ text: 'Issue', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } },
     { text: 'Resolution', options: { bold: true, color: 'FFFFFF', fill: { color: TITLE_COLOR } } }],
    ...faqRows.map(r => r.map(c => ({ text: c, options: { color: BODY_COLOR } }))),
  ];
  s16.addTable(faqTable, { x: 0.5, y: 1.1, w: 12.33, fontSize: 13, fontFace: 'Calibri', border: { pt: 1, color: 'DDDDDD' } });

  // Slide 17 — Thank You
  const s17 = pptx.addSlide();
  s17.background = { color: TITLE_COLOR };
  s17.addText('Thank You', { x: 0.5, y: 2.5, w: 12.33, h: 1.0, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  s17.addText('For queries, contact your SharePoint Administrator or Power Platform support team.', { x: 0.5, y: 3.7, w: 12.33, h: 0.6, fontSize: 16, color: 'BBDEFB', fontFace: 'Calibri', align: 'center' });
  s17.addText('SOP-DMS-001 | Drug Management System | Treta Infotech | March 2026', { x: 0.5, y: 6.8, w: 12.33, h: 0.4, fontSize: 11, color: '90CAF9', fontFace: 'Calibri', align: 'center' });

  const pptPath = path.join(outputDir, 'DMS-SOP.pptx');
  await pptx.writeFile({ fileName: pptPath });
  console.log('PowerPoint generated:', pptPath);
}

async function main() {
  await generateWord();
  await generatePPT();
  console.log('Done! Both files written to:', outputDir);
}

main().catch(err => { console.error(err); process.exit(1); });
