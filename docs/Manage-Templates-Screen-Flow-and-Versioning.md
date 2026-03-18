# Manage Templates — Screen-by-Screen Flow & Versioning

## Overview

The Manage Templates module lets administrators upload, organize, and version document templates used across the system. Templates are grouped by category (using a 3-level hierarchy), can be mapped to regulatory frameworks (eCTD, GMP, TMF), and automatically tracked with version history.

---

## Screen 1: Manage Templates — Main Grid

**What the user sees:**

This is the landing page when the user opens Manage Templates. It shows all templates in a clean table with summary cards at the top.

**Summary Cards (top section):**
- Total Templates — count of all templates
- eCTD Templates — count of templates mapped to eCTD
- GMP Templates — count of templates mapped to GMP
- TMF Templates — count of templates mapped to TMF

**Filters (below the summary cards):**
- Mapping Type — filter by eCTD, GMP, TMF, or None
- Status — filter by Active or Inactive
- Country — filter by country
- Reset button — clears all filters

**Template Grid Columns:**
| Column | What it shows |
|--------|---------------|
| Template Name | The file name with a file-type icon (Word, PDF, Excel, etc.) |
| Version | Version badge — for example: v1.0, v2.0 |
| Category | Full category path — for example: Governance and Procedures > Governance Document > Policy |
| Country | The country this template belongs to |
| Mapping Type | Color-coded badge — eCTD (blue), GMP (orange), TMF (green), None (grey) |
| Folder / Zone | The mapped CTD folder, TMF folder, or GMP category |
| Section / Model | The eCTD section or GMP model |
| Upload Date | When this version was uploaded |
| Status | Active (green badge) or Inactive (grey badge) |
| Action | View / Preview button, Version History button |

**Important behavior:**
- By default, the grid only shows the **latest version** of each template. Older versions are hidden.
- The user can select one or more templates using checkboxes to Edit or Delete them.
- An "Upload Template" button opens the Add Template flow.
- An "Excel Upload" button allows bulk import from an Excel file.
- A "Reset & Refresh" button clears filters and reloads the data.

**Version History action:**
- Each template row has a "Version History" button.
- Clicking it opens a side panel showing **all versions** of that template — including the version number, status (Active or Inactive), upload date, and who uploaded it.
- This lets the user see the full history at a glance.

---

## Screen 2: Upload Template — Step-by-Step Flow

When the user clicks "Upload Template," they see a step-by-step form. The idea is to keep it simple — the user completes each step before moving on.

### Step 1: Pick a Category

**What the user sees:**

A section titled "Which category does this template belong to?" with three dropdown menus that work in a cascading manner:

1. **Document Category** — The top-level grouping.
   - Example options: Governance and Procedures, Manufacturing and Product Quality, Validation

2. **Group** — Appears only after the user picks a Document Category. Shows groups that belong to the selected category.
   - Example options: Governance Document, Master Manufacturing Record - Product, Quality, Specification

3. **Sub-Group** — Appears only after the user picks a Group. Shows sub-groups that belong to the selected group.
   - Example options: Directive, Guideline, Policy

All three dropdowns are populated from the Categories list. The user must select all three levels before moving forward.

**Why this matters:**
- It ensures every template is properly categorized.
- The full path (e.g., "Governance and Procedures > Governance Document > Policy") is shown in the grid later.
- It prevents confusion — the user always knows exactly where their template sits in the hierarchy.

---

### Step 2: Fill in Template Details

**What the user sees:**

Once a sub-group is selected, the rest of the form appears with these fields:

| Field | Required? | Description |
|-------|-----------|-------------|
| Template Name | Yes | The name for this template (e.g., "Clinical Trial Protocol v3.0") |
| Country | No | Which country this template is used in |
| Status | No | Active (default) or Inactive |
| Mapping Type | No | None (default), eCTD, GMP, or TMF |

**If the user picks eCTD as Mapping Type, additional fields appear:**
- eCTD Module (1–5) — required
- CTD Folder — required, filtered by the selected module
- eCTD Section — required, filtered by the selected module
- eCTD Subsection — optional

**If the user picks GMP as Mapping Type:**
- Mapped GMP Model — required

**If the user picks TMF as Mapping Type:**
- Mapped TMF Folder — required

---

### Step 3: Upload File

**What the user sees:**

A drag-and-drop file picker area where the user can drop their template file or click to browse.

- Accepted file types: DOC, DOCX, PDF, XLS, XLSX
- Once a file is selected, the file name and size are shown below the picker.

---

### Step 4: Save

**What the user sees:**

Two buttons at the bottom:
- **Save Template** — saves the template
- **Cancel** — goes back to the Manage Templates grid without saving

**What happens when the user clicks Save:**

1. The system validates all required fields. If anything is missing, a clear error message appears listing what needs to be filled in.

2. The system checks if a template with the **same name** in the **same category** already exists. If it does, the user sees an "Already Exists" message (see Screen 3 below).

3. If no duplicate is found, the template is saved as **Version 1.0** with status **Active** and marked as the latest version.

4. The user is taken back to the Manage Templates grid with a success message: "Template uploaded successfully."

---

## Screen 3: "Template Already Exists" Warning

**When does this appear?**

When the user tries to save a new template and the system finds that a template with the exact same name already exists in the same category.

**What the user sees:**

A modal dialog with:
- Title: "Template Already Exists"
- Message: "A template with this name already exists in this category. Last updated on [date and time]. Would you like to update it instead?"
- Two buttons:
  - **Update** — proceeds to create a new version (see versioning logic below)
  - **Cancel** — goes back to the form so the user can change the name or category

**Why this is important:**
- It prevents accidental duplicates.
- It gives the user a clear choice — update the existing one or go back and adjust.
- It shows when the existing template was last updated, so the user can make an informed decision.

---

## Screen 4: Edit Template

**When does this appear?**

When the user selects a template in the grid and clicks the Edit button, or clicks Edit from the preview panel.

**What the user sees:**

The same form as Upload Template, but:
- The Template Name is shown but cannot be changed (it's locked).
- All other fields are pre-filled with the current values and can be modified.
- The existing file is shown with a "Remove" button. If the user removes it, a file picker appears to upload a replacement.
- The Save button says "Update Template" instead of "Save Template."

**What happens when the user clicks Update Template:**

The system uses auto-versioning (see below).

---

## How Versioning Works

### First Upload
- When a template is saved for the first time, it is created as **Version 1.0**.
- It is marked as **Active** and **IsLatestVersion = true**.
- There is no parent template (it's the original).

### Updating an Existing Template
When the user updates a template (either through the "Already Exists" warning or the Edit flow):

1. The **existing record** is updated:
   - `IsLatestVersion` is set to **false**
   - `Status` is set to **Inactive**

2. A **new record** is created with:
   - The same template name and category
   - An incremented version number (1.0 becomes 2.0, 2.0 becomes 3.0, etc.)
   - `IsLatestVersion` set to **true**
   - `Status` set to **Active**
   - `ParentTemplateId` pointing to the original (first) template record

3. The grid automatically refreshes and shows only the latest version.

### Version History Panel
- The user can click "Version History" on any template row.
- A side panel opens showing a list of all versions for that template.
- Each entry shows:
  - Version number (v1.0, v2.0, etc.)
  - Status (Active or Inactive)
  - Upload date
  - Who uploaded/updated it

### Example Scenario

| Action | Result |
|--------|--------|
| User uploads "Quality Policy.docx" for the first time | Version 1.0 created, Active, IsLatestVersion = true |
| User uploads another file with the same name "Quality Policy.docx" in the same category | System shows "Already Exists" warning |
| User clicks "Update" | Version 1.0 becomes Inactive (IsLatestVersion = false). Version 2.0 is created as Active (IsLatestVersion = true) |
| User edits Version 2.0 and saves changes | Version 2.0 becomes Inactive. Version 3.0 is created as Active |
| Grid shows | Only Version 3.0 (the latest) is visible by default |
| User clicks "Version History" on that template | Panel shows all three versions: v1.0 (Inactive), v2.0 (Inactive), v3.0 (Active) |

---

## Data Fields on the Templates List (SharePoint)

| Field Name | Type | Purpose |
|------------|------|---------|
| LinkFilename / FileLeafRef | Text | The uploaded file name |
| TemplateVersion | Text | Version number — "1.0", "2.0", etc. |
| IsLatestVersion | Yes/No | True if this is the current active version |
| ParentTemplateId | Number | Points back to the original (first) template record. Used to group all versions together. |
| Category | Lookup | Links to the Categories list (which has DocumentCategory, Group, SubGroup) |
| Country | Lookup | Links to the Countries list |
| Status | Choice | Active or Inactive |
| MappingType | Choice | eCTD, GMP, TMF, or None |
| MappedCTDFolder | Lookup | Links to CTD Folders list (when MappingType is eCTD) |
| eCTDSection | Lookup | Links to eCTD Sections list (when MappingType is eCTD) |
| eCTDSubsection | Text | Optional eCTD subsection text |
| MappedGMPModel | Lookup | Links to GMP Models list (when MappingType is GMP) |
| MappedTMFFolder | Lookup | Links to TMF Folders list (when MappingType is TMF) |
| IsEctdMapped | Yes/No | True if this template is mapped to eCTD |
| UploadDate | Date/Time | When this version was uploaded |
| IsDelete | Yes/No | Soft delete flag — true means it was deleted but the file is preserved |

---

## What Is Out of Scope

These features are **not** included in this release:

- **Approval workflow** — No approval process is needed when a new version is created. It goes live immediately.
- **Reverting to an older version** — Users cannot go back to a previous version and make it active again.
- **Bulk versioning via Excel upload** — The Excel upload feature keeps its current behavior (simple import). It does not create new versions of existing templates.

---

## Summary of Screens

| # | Screen | Purpose |
|---|--------|---------|
| 1 | Manage Templates Grid | View all templates (latest versions), filter, search, and take actions |
| 2 | Upload Template (Step-by-Step) | Add a new template: pick category, fill details, upload file, save |
| 3 | "Already Exists" Warning | Shown when a duplicate is detected — lets user choose to update or cancel |
| 4 | Edit Template | Modify an existing template's details or replace its file |
| 5 | Version History Panel | Side panel showing all versions of a template with status and dates |
