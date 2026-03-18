# DMS Power Automate Flows — Developer Reference

**System:** Drug Management System (DMS) on SharePoint Online  
**Date:** March 18, 2026  
**Prepared for:** Power Automate Developer  

> **Regenerating the Word document:** Run `node scripts/generate-pa-flows-doc.js` from the repo root after installing dependencies in the `sop-tools/` directory (`cd sop-tools && npm install`). The output is written to `Project Documents/DMS-Power-Automate-Flows.docx`.

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Assumptions](#implementation-assumptions)
3. [SharePoint Lists Reference](#sharepoint-lists-reference)
4. [Workflow 1 — DMS - Adobe Sign Implementation](#workflow-1--dms---adobe-sign-implementation)
5. [Workflow 2 — DMS - Adobe Auto Save Signed Document](#workflow-2--dms---adobe-auto-save-signed-document)
6. [Workflow 3 — DMS - Status Email Notification](#workflow-3--dms---status-email-notification)
7. [Dynamic Value Quick-Reference](#dynamic-value-quick-reference)

---

## Overview

These three Power Automate flows automate the Adobe Sign e-signature process, auto-save signed documents back to SharePoint, and send status-based email notifications throughout the DMS document lifecycle.

### Document Status Lifecycle

```
Draft → Pending Approval → Approved → Pending for Signature → Signed → Final
                       ↘ Rejected
```

### Flow Interaction Summary

| Flow | Trigger | Purpose |
|------|---------|---------|
| Flow 1 — Adobe Sign Implementation | New eSignature list item (SignatureStatus = Pending) | Send Adobe Sign agreement to Approver + Signer |
| Flow 2 — Adobe Auto Save Signed Document | Adobe Sign agreement state = SIGNED | Download signed PDF and save to SharePoint |
| Flow 3 — Status Email Notification | DMS Documents item modified (IsEmailSend = true) | Send Outlook emails for each status transition; reset flag |

---

## Implementation Assumptions

The following assumptions are made about the SharePoint environment and connector configuration before building these flows. Verify each item before enabling flows in production.

| # | Assumption | Impact if Not Met |
|---|-----------|-------------------|
| 1 | The `eSignature` SharePoint list exists with all columns listed in Section 3 (Lists Reference) | Flow 1 trigger will fail; fields will not resolve |
| 2 | The `DMS Documents` SharePoint list exists with `IsEmailSend` (Yes/No), `Status` (Choice), `Author`, `Reviewer`, `Approver` (Person or Group) columns | Flows 1, 2, 3 update steps will fail |
| 3 | The `Signed Documents` document library exists under `Shared Documents/Signed Documents/` with sub-folder structure `[DocumentType]/[DrugName]/[CTDFolder]/` pre-created, or flow step is configured to create folders | Flow 2 Create file step will fail with a path-not-found error |
| 4 | An **Adobe Acrobat Sign** Power Automate connection is established and authenticated with an account that has permission to create agreements | Flows 1 and 2 Adobe Sign steps will fail with auth errors |
| 5 | An **Office 365 Outlook** Power Automate connection is established and authenticated with a shared mailbox or service account for outbound email | Flow 3 Send email steps will fail |
| 6 | A **SharePoint** Power Automate connection is established for the target SharePoint site | All SharePoint action steps in all three flows will fail |
| 7 | The `Author`, `Reviewer`, and `Approver` columns on `DMS Documents` are **Person or Group** columns (not plain text) so that `/Email` and `/DisplayName` sub-properties are available at runtime | Flow 3 email recipient expressions will return blank values |
| 8 | The SPFx application sets `SignatureStatus = 'Pending'` when creating the `eSignature` list item, and sets `IsEmailSend = true` when updating `DMS Documents` status | Flows 1 and 3 trigger conditions will never pass |
| 9 | Internal column names (e.g., `FilePath`, `AgreementId`, `IsEmailSend`) match exactly the names used in the expressions in this document | Flow expressions will return null/empty values |
| 10 | Action names within each flow are set **exactly** as specified in the step tables (e.g., `Get_file_content`, `Create_an_agreement`, `Compose_AgreementId`) | `outputs('...')` references in downstream steps will break |

> **Action naming convention:** Power Automate auto-generates internal action names by replacing spaces with underscores. The expressions in this document assume the action display names shown in each step table. If you rename an action, update all `outputs('...')` references that depend on it.

---

## SharePoint Lists Reference

### List: `eSignature`

| Column (Internal Name) | Type | Description |
|------------------------|------|-------------|
| `Title` | Single line of text | Document name |
| `FilePath` | Single line of text | Server-relative URL to the source file (e.g., `/sites/DMS/DMSDocuments/filename.docx`) |
| `FileName` | Single line of text | Filename with extension (e.g., `Protocol_v2.docx`) |
| `SignerEmail` | Single line of text | Email of the primary signer (Reviewer) |
| `ApproverEmail` | Single line of text | Email of the Approver |
| `SignatureStatus` | Choice | Current signature state: `Pending`, `Sent`, `Signed` |
| `AgreementId` | Single line of text | Adobe Sign agreement ID (written back by Flow 1) |
| `DocumentId` | Number | ID of the corresponding item in the `DMS Documents` list |
| `DocumentType` | Choice | Document classification: `eCTD`, `TMF`, `GMP` |
| `CTDFolder` | Single line of text | CTD/TMF/GMP folder name (used for storage path) |
| `CTDModule` | Single line of text | Module/section descriptor |
| `DrugName` | Single line of text | Drug/product name (used for storage path) |
| `DrugId` | Number | Lookup ID from the `Drugs Database` list |
| `InitiatedBy` | Single line of text | Display name of user who initiated signing |
| `InitiatedDate` | Date and Time | ISO timestamp when signing was initiated |
| `SignatureCompletedOn` | Date and Time | ISO timestamp when signing was completed (written by Flow 2) |
| `SignedDocumentPath` | Single line of text | Server-relative path to the saved signed PDF (written by Flow 2) |

### List: `DMS Documents`

| Column (Internal Name) | Type | Description |
|------------------------|------|-------------|
| `ID` | Number (auto) | SharePoint item ID |
| `Title` | Single line of text | Document name |
| `Status` | Choice | Workflow state: `Draft`, `Pending Approval`, `Approved`, `Pending for Signature`, `Signed`, `Final`, `Rejected` |
| `IsEmailSend` | Yes/No (Boolean) | Flag that triggers Flow 3; set to `true` on every status change, reset to `false` after email sent |
| `Author` (lookup) | Person or Group | Document author |
| `AuthorId` | Number | Lookup ID for Author |
| `Reviewer` (lookup) | Person or Group | Assigned reviewer / primary signer |
| `ReviewerId` | Number | Lookup ID for Reviewer |
| `Approver` (lookup) | Person or Group | Assigned approver |
| `ApproverId` | Number | Lookup ID for Approver |
| `Comments` | Multiple lines | JSON array of audit log comments |
| `CTDFolder` | Single line of text | CTD/TMF/GMP folder path segment |
| `CTDModule` | Single line of text | Module name/number |
| `Submodule` | Single line of text | Submodule name |
| `Drug` (lookup) | Lookup | Drug/product from Drugs Database |
| `DrugId` | Number | Lookup ID for Drug |
| `SharePointURL` | Hyperlink | URL + Description pointing to the document file |
| `FileLeafRef` | Single line of text | Filename with extension |
| `FileRef` | Single line of text | Server-relative path to the file |

---

## Workflow 1 — DMS - Adobe Sign Implementation

### Purpose
Triggered when a new item is created in the `eSignature` SharePoint list with `SignatureStatus = Pending`. Retrieves the document file from SharePoint, creates an Adobe Sign agreement with the Approver as participant order 1 and the Signer as participant order 2, updates the `eSignature` item to `Sent` with the returned `AgreementId`, and sets `IsEmailSend = true` on the matching `DMS Documents` item to trigger the notification flow.

### Trigger
- **Connector:** SharePoint
- **Action:** When an item is created
- **Site Address:** `[Your SharePoint Site URL]`
- **List Name:** `eSignature`

### Steps

#### Step 1 — Condition: Check SignatureStatus = Pending

| Property | Value |
|----------|-------|
| **Action** | Condition |
| **Left value** | `triggerOutputs()?['body/SignatureStatus']` |
| **Operator** | is equal to |
| **Right value** | `Pending` |

> If **No** (SignatureStatus is not Pending): Terminate the flow. Do not proceed.

---

#### Step 2 — Get File Content

> **Purpose:** Retrieve the binary content of the document from SharePoint so it can be sent to Adobe Sign.

| Property | Value |
|----------|-------|
| **Action** | Get file content |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **File Identifier** | `triggerOutputs()?['body/FilePath']` ← from `eSignature.FilePath` |

**Output variable name:** `fileContent`

---

#### Step 3 — Create Agreement in Adobe Sign

> **Purpose:** Upload the document and create an agreement with two participants — Approver (signs first, order 1) and Signer (signs second, order 2).

| Property | Value |
|----------|-------|
| **Action** | Create an agreement |
| **Connector** | Adobe Sign |

**Agreement configuration:**

| Field | Value | Source |
|-------|-------|--------|
| Agreement name | `triggerOutputs()?['body/Title']` | `eSignature.Title` |
| File content | `outputs('Get_file_content')?['body/$content']` | Step 2 output |
| File name | `triggerOutputs()?['body/FileName']` | `eSignature.FileName` |
| Signature type | `ESIGN` | Static |
| State | `IN_PROCESS` | Static |

**Participants (Recipient Set):**

Participant Set 1 — Approver:

| Field | Value | Source |
|-------|-------|--------|
| Role | `APPROVER` | Static |
| Order | `1` | Static |
| Email | `triggerOutputs()?['body/ApproverEmail']` | `eSignature.ApproverEmail` |

Participant Set 2 — Signer:

| Field | Value | Source |
|-------|-------|--------|
| Role | `SIGNER` | Static |
| Order | `2` | Static |
| Email | `triggerOutputs()?['body/SignerEmail']` | `eSignature.SignerEmail` |

**Output variable name:** `adobeSignAgreement`  
**Key output field:** `body/id` → the AgreementId returned by Adobe Sign

---

#### Step 4 — Update eSignature Item (Sent + AgreementId)

> **Purpose:** Mark the eSignature record as `Sent` and store the AgreementId for later lookup by Flow 2.

| Property | Value |
|----------|-------|
| **Action** | Update item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `eSignature` |
| **Id** | `triggerOutputs()?['body/ID']` ← SharePoint item ID from trigger |

**Fields to update:**

| Column | Value | Source |
|--------|-------|--------|
| `SignatureStatus` | `Sent` | Static |
| `AgreementId` | `outputs('Create_an_agreement')?['body/id']` | Adobe Sign Step 3 output |

---

#### Step 5 — Get DMS Documents Item

> **Purpose:** Look up the corresponding `DMS Documents` item using the `DocumentId` stored in the `eSignature` record.

| Property | Value |
|----------|-------|
| **Action** | Get item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `DMS Documents` |
| **Id** | `triggerOutputs()?['body/DocumentId']` ← from `eSignature.DocumentId` |

**Output variable name:** `dmsDocumentItem`

---

#### Step 6 — Update DMS Documents Item (IsEmailSend = true)

> **Purpose:** Set `IsEmailSend = true` on the DMS Documents record to trigger Flow 3 (Status Email Notification) so the Signer and Approver receive a notification that signing is underway.

| Property | Value |
|----------|-------|
| **Action** | Update item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `DMS Documents` |
| **Id** | `outputs('Get_item')?['body/ID']` ← from Step 5 |

**Fields to update:**

| Column | Value | Source |
|--------|-------|--------|
| `IsEmailSend` | `true` | Static |

> **Note:** The `Status` on `DMS Documents` was already set to `Pending for Signature` by the SPFx application before creating the `eSignature` item. This step only sets the email flag; Flow 3 handles sending the email.

---

### Flow 1 — Full Step Summary

```
Trigger: eSignature — When item is created
  │
  ├─ Step 1: Condition — SignatureStatus equals "Pending"?
  │     No → Terminate
  │     Yes ↓
  │
  ├─ Step 2: SharePoint — Get file content
  │          File path: eSignature.FilePath
  │
  ├─ Step 3: Adobe Sign — Create agreement
  │          Name: eSignature.Title
  │          File: [Step 2 content]
  │          Participant 1: ApproverEmail (order 1, APPROVER)
  │          Participant 2: SignerEmail (order 2, SIGNER)
  │
  ├─ Step 4: SharePoint — Update eSignature item
  │          SignatureStatus → "Sent"
  │          AgreementId → [Step 3 agreement ID]
  │
  ├─ Step 5: SharePoint — Get DMS Documents item
  │          ID: eSignature.DocumentId
  │
  └─ Step 6: SharePoint — Update DMS Documents item
             IsEmailSend → true
```

---

## Workflow 2 — DMS - Adobe Auto Save Signed Document

### Purpose
Triggered when an Adobe Sign agreement reaches the `SIGNED` state. Downloads the signed PDF, finds the corresponding `eSignature` record by `AgreementId`, saves the PDF to the correct path in the SharePoint `Signed Documents` library, then updates both the `eSignature` item and the `DMS Documents` item.

### Trigger
- **Connector:** Adobe Sign
- **Action:** When an agreement is updated / When agreement status changes to SIGNED
- **Trigger type:** `Agreement State Change`
- **Agreement State:** `SIGNED`

---

### Steps

#### Step 1 — Compose AgreementId

> **Purpose:** Extract and store the AgreementId from the trigger body for reuse across multiple steps.

| Property | Value |
|----------|-------|
| **Action** | Compose |
| **Inputs** | `triggerOutputs()?['body/id']` |

**Output variable name:** `varAgreementId`

---

#### Step 2 — Initialize AgreementStatus Variable

> **Purpose:** Initialize a string variable to hold the current agreement status for use in conditions.

| Property | Value |
|----------|-------|
| **Action** | Initialize variable |
| **Name** | `varAgreementStatus` |
| **Type** | String |
| **Value** | `triggerOutputs()?['body/status']` |

---

#### Step 3 — Condition: AgreementStatus = SIGNED?

| Property | Value |
|----------|-------|
| **Action** | Condition |
| **Left value** | `variables('varAgreementStatus')` |
| **Operator** | is equal to |
| **Right value** | `SIGNED` |

> If **No**: Terminate the flow. Only proceed when fully signed.

---

#### Step 4 — Download Signed Document

> **Purpose:** Download the combined signed PDF from Adobe Sign.

| Property | Value |
|----------|-------|
| **Action** | Get document |
| **Connector** | Adobe Sign |
| **Agreement ID** | `outputs('Compose_AgreementId')` ← from Step 1 |
| **Document type** | `COMBINED` (returns the full signed PDF) |

**Output variable name:** `signedPdfContent`

---

#### Step 5 — Get eSignature Record by AgreementId

> **Purpose:** Find the `eSignature` SharePoint list item that matches this agreement so we can retrieve `DocumentId`, `DrugName`, `DocumentType`, `CTDFolder`, `CTDModule`, and the original `Title`.
> **Action display name in Power Automate:** `Get - eSignature Record by AgreementId` (internal name: `Get_-_eSignature_Record_by_AgreementId`)

| Property | Value |
|----------|-------|
| **Action** | Get items |
| **Display name** | `Get - eSignature Record by AgreementId` |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `eSignature` |
| **Filter Query** | `AgreementId eq '@{outputs('Compose_AgreementId')}'` |
| **Top Count** | `1` |

**Key output fields used in subsequent steps** (action reference: `Get_-_eSignature_Record_by_AgreementId`):

| Field | Expression |
|-------|-----------|
| eSign item ID | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']` |
| DocumentId | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']` |
| Title | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']` |
| DocumentType | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']` |
| DrugName | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']` |
| CTDFolder | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']` |
| CTDModule | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDModule']` |

---

#### Step 6 — Compose Signed File Name

> **Purpose:** Build the filename for the saved signed PDF, incorporating a UTC timestamp for uniqueness.
> **Action display name in Power Automate:** `Compose - Signed File Name` (internal name auto-generated as `Compose_-_Signed_File_Name`; referenced in downstream steps as `outputs('Compose_-_Signed_File_Name')`)

| Property | Value |
|----------|-------|
| **Action** | Compose |
| **Display name** | `Compose - Signed File Name` |
| **Inputs** | `Signed_@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']}_@{utcNow('yyyyMMddHHmmss')}.pdf` |

**Referenced in later steps as:** `outputs('Compose_-_Signed_File_Name')`

---

#### Step 7 — Compose Storage Folder Path

> **Purpose:** Build the full server-relative folder path for the signed PDF under the `Signed Documents` library.
> **Action display name in Power Automate:** `Compose - Storage Folder Path` (internal name: `Compose_-_Storage_Folder_Path`)

| Property | Value |
|----------|-------|
| **Action** | Compose |
| **Display name** | `Compose - Storage Folder Path` |
| **Inputs** | `/sites/[YourSite]/Shared Documents/Signed Documents/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']}/@{first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']}/` |

> **Note:** Replace `/sites/[YourSite]` with your actual site's server-relative URL.

**Referenced in later steps as:** `outputs('Compose_-_Storage_Folder_Path')`

---

#### Step 8 — Create Signed File in SharePoint

> **Purpose:** Upload the signed PDF to the resolved folder path in the `Shared Documents/Signed Documents/` library.
> **Action display name in Power Automate:** `Create file - Signed Document` (internal name: `Create_file_-_Signed_Document`)

| Property | Value |
|----------|-------|
| **Action** | Create file |
| **Display name** | `Create file - Signed Document` |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **Folder Path** | `outputs('Compose_-_Storage_Folder_Path')` ← from Step 7 |
| **File Name** | `outputs('Compose_-_Signed_File_Name')` ← from Step 6 |
| **File Content** | `outputs('Get_document')?['body/$content']` ← from Step 4 |

**Referenced in later steps as:** `outputs('Create_file_-_Signed_Document')`  
**Key output field:** `body/Path` → server-relative path of the saved file

---

#### Step 9 — Update eSignature Item (Signed)

> **Purpose:** Mark the `eSignature` record as `Signed` and record the completion timestamp and saved file path.

| Property | Value |
|----------|-------|
| **Action** | Update item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `eSignature` |
| **Id** | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']` ← eSign item ID from Step 5 |

**Fields to update:**

| Column | Value | Source |
|--------|-------|--------|
| `SignatureStatus` | `Signed` | Static |
| `SignatureCompletedOn` | `utcNow()` | Dynamic — Power Automate expression |
| `SignedDocumentPath` | `outputs('Create_file_-_Signed_Document')?['body/Path']` | Step 8 output |

---

#### Step 10 — Get DMS Documents Item

> **Purpose:** Retrieve the corresponding `DMS Documents` item to prepare for status update.

| Property | Value |
|----------|-------|
| **Action** | Get item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `DMS Documents` |
| **Id** | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']` ← from Step 5 |

---

#### Step 11 — Update DMS Documents Item (Status = Signed, IsEmailSend = true)

> **Purpose:** Update the document status to `Signed` and set `IsEmailSend = true` to trigger Flow 3 (Status Email Notification) to notify the Author and Approver.

| Property | Value |
|----------|-------|
| **Action** | Update item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `DMS Documents` |
| **Id** | `outputs('Get_item')?['body/ID']` ← from Step 10 |

**Fields to update:**

| Column | Value | Source |
|--------|-------|--------|
| `Status` | `Signed` | Static |
| `IsEmailSend` | `true` | Static |

---

### Flow 2 — Full Step Summary

```
Trigger: Adobe Sign — Agreement state changes to SIGNED
  │
  ├─ Step 1: Compose — AgreementId (from trigger body/id)
  │
  ├─ Step 2: Initialize variable — varAgreementStatus (from trigger body/status)
  │
  ├─ Step 3: Condition — varAgreementStatus equals "SIGNED"?
  │     No → Terminate
  │     Yes ↓
  │
  ├─ Step 4: Adobe Sign — Get document (COMBINED signed PDF)
  │          Agreement ID: varAgreementId
  │
  ├─ Step 5: SharePoint — Get items from eSignature
  │          Filter: AgreementId eq varAgreementId
  │          Top: 1
  │
  ├─ Step 6: Compose — Signed filename
  │          "Signed_[Title]_[utcNow()].pdf"
  │
  ├─ Step 7: Compose — Storage folder path
  │          "/Shared Documents/Signed Documents/[DocumentType]/[DrugName]/[CTDFolder]/"
  │
  ├─ Step 8: SharePoint — Create file
  │          Library: Signed Documents
  │          Path: Step 7 output
  │          Name: Step 6 output
  │          Content: Step 4 signed PDF
  │
  ├─ Step 9: SharePoint — Update eSignature item
  │          SignatureStatus → "Signed"
  │          SignatureCompletedOn → utcNow()
  │          SignedDocumentPath → Step 8 file path
  │
  ├─ Step 10: SharePoint — Get DMS Documents item
  │           ID: eSignRecord.DocumentId
  │
  └─ Step 11: SharePoint — Update DMS Documents item
              Status → "Signed"
              IsEmailSend → true
```

---

## Workflow 3 — DMS - Status Email Notification

### Purpose
Triggered whenever a `DMS Documents` item is modified **and** `IsEmailSend = true`. Uses a Switch statement on the document's `Status` field to send the correct Outlook email to the right recipients, then resets `IsEmailSend = false` on the item.

### Trigger
- **Connector:** SharePoint
- **Action:** When an existing item is modified
- **Site Address:** `[Your SharePoint Site URL]`
- **List Name:** `DMS Documents`

---

### Steps

#### Step 1 — Condition: IsEmailSend = true?

| Property | Value |
|----------|-------|
| **Action** | Condition |
| **Left value** | `triggerOutputs()?['body/IsEmailSend']` |
| **Operator** | is equal to |
| **Right value** | `true` |

> If **No**: Terminate. The modification was not a status-driven email event (e.g., a manual edit).

---

#### Step 2 — Switch on Status

| Property | Value |
|----------|-------|
| **Action** | Switch |
| **On** | `triggerOutputs()?['body/Status']` |

The Switch has **6 Cases** as defined below.

---

#### Case 1 — Status: "Pending Approval"

**Email recipient:** Approver  
**Trigger event:** Author submitted the document for approval.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Approver/Email']` |
| **Subject** | `Action Required: Document Pending Your Approval — @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Approver/DisplayName']},

A document has been submitted and is awaiting your approval in the Drug Management System (DMS).

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Author:          @{triggerOutputs()?['body/Author/DisplayName']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Submitted On:    @{triggerOutputs()?['body/Modified']}

Please log in to the DMS portal to review and approve or reject the document.

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Case 2 — Status: "Approved"

**Email recipient:** Author  
**Trigger event:** Approver approved the document.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Author/Email']` |
| **Subject** | `Your Document Has Been Approved — @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Author/DisplayName']},

Your document has been approved in the Drug Management System (DMS).

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Approved By:     @{triggerOutputs()?['body/Approver/DisplayName']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Approved On:     @{triggerOutputs()?['body/Modified']}

The document is now ready to proceed to the e-signature stage.

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Case 3 — Status: "Rejected"

**Email recipient:** Author  
**Trigger event:** Approver rejected the document. Include the rejection comments.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Author/Email']` |
| **Subject** | `Document Rejected — Action Required: @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Author/DisplayName']},

Unfortunately, your document has been rejected in the Drug Management System (DMS). Please review the comments below and revise accordingly.

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Rejected By:     @{triggerOutputs()?['body/Approver/DisplayName']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Rejected On:     @{triggerOutputs()?['body/Modified']}

Reviewer / Approver Comments:
  @{triggerOutputs()?['body/Comments']}

Please log in to the DMS portal to revise and resubmit the document.

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Case 4 — Status: "Pending for Signature"

**Email recipients:** Signer (To) + Approver (CC)  
**Trigger event:** Signing process has been initiated; Adobe Sign agreement has been sent.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Reviewer/Email']` |
| **CC** | `triggerOutputs()?['body/Approver/Email']` |
| **Subject** | `Action Required: E-Signature Requested — @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Reviewer/DisplayName']},

An e-signature has been requested for the following document in the Drug Management System (DMS). You will receive a separate email from Adobe Sign with the signing link.

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Initiated By:    @{triggerOutputs()?['body/Author/DisplayName']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Requested On:    @{triggerOutputs()?['body/Modified']}

Please check your email for the Adobe Sign signing request and complete your signature at your earliest convenience.

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Case 5 — Status: "Signed"

**Email recipients:** Author (To) + Approver (CC)  
**Trigger event:** All signatories have completed signing in Adobe Sign.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Author/Email']` |
| **CC** | `triggerOutputs()?['body/Approver/Email']` |
| **Subject** | `Document Signed Successfully — @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Author/DisplayName']},

All required signatures have been collected for the following document. The signed PDF has been automatically saved to the Signed Documents library.

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Signed On:       @{triggerOutputs()?['body/Modified']}
  - Signed By:       @{triggerOutputs()?['body/Reviewer/DisplayName']}

The document has been filed under:
  Signed Documents / @{triggerOutputs()?['body/CTDFolder']}

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Case 6 — Status: "Final"

**Email recipients:** Author, Reviewer, Approver (all)  
**Trigger event:** Document has been fully finalized in the DMS.

| Property | Value |
|----------|-------|
| **Action** | Send an email (V2) |
| **Connector** | Office 365 Outlook |
| **To** | `triggerOutputs()?['body/Author/Email']` |
| **CC** | `@{triggerOutputs()?['body/Reviewer/Email']}; @{triggerOutputs()?['body/Approver/Email']}` |
| **Subject** | `Document Finalized — @{triggerOutputs()?['body/Title']}` |

**Body:**
```
Dear @{triggerOutputs()?['body/Author/DisplayName']},

The following document has been finalized in the Drug Management System (DMS) and is now available in the Signed Documents library for reference.

Document Details:
  - Document Name:   @{triggerOutputs()?['body/Title']}
  - Drug / Product:  @{triggerOutputs()?['body/Drug/LookupValue']}
  - CTD Folder:      @{triggerOutputs()?['body/CTDFolder']}
  - Finalized On:    @{triggerOutputs()?['body/Modified']}

No further action is required. The signed and finalized document has been filed in the DMS repository.

[Open DMS Portal]

Regards,
Drug Management System — Automated Notification
```

---

#### Step 3 — Reset IsEmailSend = false

> **Purpose:** After sending the email, reset the `IsEmailSend` flag to `false` so this flow does not re-trigger on the same status event.

> **Important:** This step runs **after the Switch** (outside of all Cases) as the final step in the **Yes** branch of Step 1.

| Property | Value |
|----------|-------|
| **Action** | Update item |
| **Connector** | SharePoint |
| **Site Address** | `[Your SharePoint Site URL]` |
| **List Name** | `DMS Documents` |
| **Id** | `triggerOutputs()?['body/ID']` |

**Fields to update:**

| Column | Value |
|--------|-------|
| `IsEmailSend` | `false` |

---

### Flow 3 — Full Step Summary

```
Trigger: DMS Documents — When existing item is modified
  │
  ├─ Step 1: Condition — IsEmailSend equals true?
  │     No → Terminate
  │     Yes ↓
  │
  ├─ Step 2: Switch on Status
  │     │
  │     ├─ Case "Pending Approval"
  │     │     → Send email To: Approver
  │     │
  │     ├─ Case "Approved"
  │     │     → Send email To: Author
  │     │
  │     ├─ Case "Rejected"
  │     │     → Send email To: Author (with Comments body)
  │     │
  │     ├─ Case "Pending for Signature"
  │     │     → Send email To: Reviewer (Signer), CC: Approver
  │     │
  │     ├─ Case "Signed"
  │     │     → Send email To: Author, CC: Approver
  │     │
  │     └─ Case "Final"
  │           → Send email To: Author, CC: Reviewer + Approver
  │
  └─ Step 3: SharePoint — Update DMS Documents item
             IsEmailSend → false
```

---

## Dynamic Value Quick-Reference

### Flow 1 — All Dynamic Values

| Value Used | Expression | Source List & Column |
|-----------|-----------|---------------------|
| Document name | `triggerOutputs()?['body/Title']` | eSignature → Title |
| File server-relative path | `triggerOutputs()?['body/FilePath']` | eSignature → FilePath |
| Filename with extension | `triggerOutputs()?['body/FileName']` | eSignature → FileName |
| Approver email | `triggerOutputs()?['body/ApproverEmail']` | eSignature → ApproverEmail |
| Signer email | `triggerOutputs()?['body/SignerEmail']` | eSignature → SignerEmail |
| eSignature item ID | `triggerOutputs()?['body/ID']` | eSignature → ID (auto) |
| DMS Documents item ID | `triggerOutputs()?['body/DocumentId']` | eSignature → DocumentId |
| Adobe Sign Agreement ID | `outputs('Create_an_agreement')?['body/id']` | Adobe Sign Step 3 output |

### Flow 2 — All Dynamic Values

> All `Get_-_eSignature_Record_by_AgreementId` references correspond to the **Step 5** action named `Get - eSignature Record by AgreementId`. All `Create_file_-_Signed_Document` references correspond to the **Step 8** action named `Create file - Signed Document`.

| Value Used | Expression | Source |
|-----------|-----------|--------|
| Adobe Sign Agreement ID (from trigger) | `triggerOutputs()?['body/id']` | Adobe Sign trigger |
| Agreement status | `triggerOutputs()?['body/status']` | Adobe Sign trigger |
| Signed PDF binary | `outputs('Get_document')?['body/$content']` | Adobe Sign Step 4 |
| eSign item ID | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['ID']` | eSignature list Step 5 |
| Document name (for filename) | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['Title']` | eSignature → Title |
| DocumentType (for folder) | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentType']` | eSignature → DocumentType |
| DrugName (for folder) | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DrugName']` | eSignature → DrugName |
| CTDFolder (for folder) | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['CTDFolder']` | eSignature → CTDFolder |
| DMS Documents ID | `first(outputs('Get_-_eSignature_Record_by_AgreementId')?['body/value'])?['DocumentId']` | eSignature → DocumentId |
| UTC timestamp (filename) | `utcNow('yyyyMMddHHmmss')` | Power Automate built-in |
| Saved file path | `outputs('Create_file_-_Signed_Document')?['body/Path']` | SharePoint Step 8 output |

### Flow 3 — All Dynamic Values

| Value Used | Expression | Source List & Column |
|-----------|-----------|---------------------|
| Email send flag | `triggerOutputs()?['body/IsEmailSend']` | DMS Documents → IsEmailSend |
| Document status | `triggerOutputs()?['body/Status']` | DMS Documents → Status |
| DMS Documents item ID | `triggerOutputs()?['body/ID']` | DMS Documents → ID (auto) |
| Document name | `triggerOutputs()?['body/Title']` | DMS Documents → Title |
| Author display name | `triggerOutputs()?['body/Author/DisplayName']` | DMS Documents → Author (Person) |
| Author email | `triggerOutputs()?['body/Author/Email']` | DMS Documents → Author (Person) |
| Reviewer display name | `triggerOutputs()?['body/Reviewer/DisplayName']` | DMS Documents → Reviewer (Person) |
| Reviewer email | `triggerOutputs()?['body/Reviewer/Email']` | DMS Documents → Reviewer (Person) |
| Approver display name | `triggerOutputs()?['body/Approver/DisplayName']` | DMS Documents → Approver (Person) |
| Approver email | `triggerOutputs()?['body/Approver/Email']` | DMS Documents → Approver (Person) |
| Drug / product name | `triggerOutputs()?['body/Drug/LookupValue']` | DMS Documents → Drug (Lookup) |
| CTD Folder | `triggerOutputs()?['body/CTDFolder']` | DMS Documents → CTDFolder |
| Comments (for rejection) | `triggerOutputs()?['body/Comments']` | DMS Documents → Comments |
| Last modified date | `triggerOutputs()?['body/Modified']` | DMS Documents → Modified (auto) |

---

*End of DMS Power Automate Flows — Developer Reference*
