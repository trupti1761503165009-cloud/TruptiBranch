# Document Management - Screen Specification

This document provides a comprehensive breakdown of the Document screen UI layout, functionality, logic workflows, and Power Automate flow designs.

---

## 1. Screen Tabs & Role Visibility

The Document Screen operates using a tabbed/filtered Navigation structure to organize records:

1. **All Documents**: Visible *only* to users in the Admin group. Displays every document across the system, regardless of author or status.
2. **My Documents**: Visible to all users. Displays only the documents *Authored / Created* by the currently logged-in user.
3. **Assigned to Me**: Visible to all users. Displays documents actively routed to the logged-in user for Action (The logged-in user is set as the `Approver`).
   - The grid under this tab specifically forces the **Status** column to be mandatory/visible, letting the Approver immediately see the stage of the document (e.g., `Pending Approval`).

---

## 2. UI Layout & Enhancements (Folder Structure)

### 2.1 Fixed Filters & Summary Cards
- Like the Category screen, **Cards** and **Universal Filters** (e.g., Country, Status, Dates) must remain fixed horizontally at the *top* of the screen.
- As the user clicks deeper down into Level 2 or Level 3 (e.g., inside the *Drug Folder* ➔ *Document Folders*), the Breadcrumb adjusts directly above the datagrid. 
- Filters **do not duplicate or render per level**. They stay at the absolute top of the page, preventing awkward spacing on 3rd-level breadcrumbs.

### 2.2 Visualizing Document Storage (eCTD, TMF, GMP)
- Documents are physically saved to a native SharePoint Document Library.
- The SpFX Web Part dynamically builds the folder visualization based on the `Template Type` assigned, pulling the actual folder hierarchy from pre-defined Master Lists (`eCTD Master`, `TMF Master`, `GMP Master`). 
- We do not create folders from scratch; the system overlays the newly created document into the appropriate predefined folder layer based on its drug and mapping.
- **eCTD View**: Visually constructs the grid rows into `Module 1`, `Module 2`, `Module 3` folders according to the eCTD Master.
- **TMF View**: Visually constructs the grid rows matching standard Trial Master File index layers according to the TMF Master.
- **GMP View**: Visually constructs the grid rows matching Good Manufacturing Practice hierarchies according to the GMP Master.

---

## 3. "Add Document" Form Controls

The Add form should be a full-screen layout matching the clean visual UI / background styling of the other forms in the system.

### Form Field Bindings
| Field | Type | Logic / Dependency | Validations |
| :--- | :--- | :--- | :--- |
| **Drug** | Dropdown | Loads all active Drugs from the master list. | Required |
| **Country** | Dropdown | Loads applicable countries. **Crucial:** Drives the Template filtering. | Required |
| **Template** | Dropdown | Disables until `Country` is selected. Loads only valid templates mapped to that specific Country/Drug. | Required |
| **Approver** | Dropdown | Auto-loads users strictly from `"HR"` and `"Admin"` SharePoint Groups. | Required |
| **Comments** | Textbox | General remarks by author upon initialization. | Optional |

### Advanced Form Logic / Validations
- **Duplicate File Prevention**: The system must validate that the identical file (same drug, same mapping, same core properties) does not already exist. If it does, prevent submission and show an error.

---

## 4. Document Operations

### 4.1 Delete (Soft-Delete Mechanism)
- Documents are **never physically deleted** directly from the underlying Document Library to preserve audit trails.
- **Action**: When an Admin clicks "Delete" on a Drug folder or specific document row.
- **Logic**: The system sets an `IsDeleted = true` flag item on the metadata.
- Visually, the UI immediately filters out items where `IsDeleted == true`.
- If an Admin later explicitly requests to view deleted items, a secondary filter toggle ("Show Deleted") can reveal them.

### 4.2 Edit
- Allows updating non-locked metadata (e.g., renaming the visual title, swapping Approver if permitted while in Draft mode).

---

## 5. End-To-End Document Workflow Lifecycle

The journey of a document from creation to final index generation:

1. **Initialization (`Draft`)**: The Author fills the Add form and creates the document. Status is explicitly set to `Draft`. The Author works on the file.
2. **Submit for Review (`Pending Approval`)**: Author hits "Submit". Status changes to `Pending Approval`. Document moves to the Approver's "Assigned to Me" tab.
3. **Approver Actions (Panel)**: 
   - Approver clicks "View", opening the Word file in the Panel.
   - **Scenario A (Reject)**: Approver adds comments inside the Word file and clicks "Reject". Status becomes `Rejected`. Bounces back to the Author's queue to correct. (Cycle repeats until perfect).
   - **Scenario B (Approve)**: Approver clicks "Approve". Status becomes `Approved`. 
4. **Signature Routing (`Pending Signature`)**: Once approved, the document is routed back to the Author for final Electronic Signature. Status updates to `Pending Signature`.
5. **Signed & Finalized (`Signed`)**: The Author successfully signs the document.
6. **Version Split Event**:
   - The SP backend generates **Version 1**: The original working file containing all Microsoft Word comments/track-changes.
   - The SP backend generates **Version 2**: The flattened, clean PDF containing the Signature.
7. **Index Generation**: The final signed version is programmatically indexed. Since the folder structure is already defined in the Master Lists (eCTD, TMF, or GMP), the document is simply assigned the metadata classifying it under that specific physical library path. This ensures it displays in the correct node for that specific Drug.

---

## 6. Power Automate (Flow) Manual Setup Guide

To power the workflow above, you will build a Power Automate Flow.

**Trigger**: `When an item is created or modified`
**Target List**: The exact SharePoint Document Library OR metadata list holding the Document records (e.g., `Documents` or `DrugDocuments` list).

### Logic Branch: Switch Case based on `[Status]` Value

**Case 1: Pending Approval**
- **Action**: `Send an Email (V2)`
- **To**: `[Approver Email]` (Dynamic content from Form)
- **CC**: `[Admin Group Email]`
- **Subject**: Action Required: Review Document [Document Name]
- **Body**: "Hello [Approver], a new document has been assigned to you by [Author] for approval. Please navigate to the Drug Management System 'Assigned to Me' tab to review it."

**Case 2: Rejected**
- **Action**: `Send an Email (V2)`
- **To**: `[Author Email]` (Creator of the item)
- **CC**: `[Admin Group Email]`
- **Subject**: Action Required: Document Rejected - [Document Name]
- **Body**: "Hello [Author], unfortunately, your document was Rejected by [Approver]. Please review their specific track-changes and comments inside the Word file pane, make corrections, and resubmit."

**Case 3: Approved**
- **Action**: `Send an Email (V2)`
- **To**: `[Author Email]`
- **Subject**: Document Approved: [Document Name]
- **Body**: "Your document has been approved by the reviewer. Please navigate to the portal to finalize the eSignature."

**Case 4: Pending Signature (Adobe Sign Integration block)**
- **Action 1**: Connect to Adobe Sign `Upload a Document and Get a document ID`.
- **Action 2**: Create an Adobe Sign `Agreement` targeted to the Author's email.
- **Action 3**: `Send an Email (V2)` to Author: "Please check your inbox for the Adobe Sign link."

**Case 5: Signed (Completion block)**
- **Action 1**: Adobe sign webhook or polling retrieves Signed PDF.
- **Action 2**: `Create file` (Saves Version 2 clean PDF to the correct SharePoint Archival Folder).
- **Action 3**: Send final "Completed" email to Author and Admins.

---

## 7. Reference Code Snippets

### MemoizedDetailList Implementation for Grid Actions
```tsx
<div className={isSiteLevelComponent ? "zoneCardBox" : ""}>
    <MemoizedDetailList
        manageComponentView={props.manageComponentView}
        columns={columnsEquipment} // Replace with specific columns
        items={FilteredData || []}
        reRenderComponent={true}
        CustomselectionMode={isVisibleCrud.current ? SelectionMode.multiple : SelectionMode.none} // Always true for CRUD
        searchable={true}
        isAddNew={true}
        onItemInvoked={_onItemInvoked}
        onSelectedItem={_onItemSelected}
        _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
        
        {/* Row Selection Actions (Edit/Delete) */}
        addEDButton={isDisplayEDbtn && isVisibleCrud.current && <>
            <div className='dflex'>
                {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit" onClick={onclickEdit}>
                    <TooltipHost content={"Edit Detail"} id={tooltipId}>
                        <FontAwesomeIcon icon="edit" />
                    </TooltipHost>
                </Link>}
                <Link className="actionBtn iconSize btnDanger ml-10" onClick={onclickconfirmdelete}>
                    <TooltipHost content={"Delete"} id={tooltipId}>
                        <FontAwesomeIcon icon="trash-alt" />
                    </TooltipHost>
                </Link>
            </div>
        </>}

        {/* Top-Bar Global Actions */}
        addNewContent={isVisibleCrud.current ?
            <div className='dflex'>
                {/* Export / Download Options */}
                <Link className="btn-back-ml-4 dticon">
                    <TooltipHost content="Export options">
                        <DefaultButton
                            text="Export"
                            iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                            menuProps={menuProps}
                            className="btn export-btn-primary"
                        />
                    </TooltipHost>
                </Link>
                
                {/* Add Button */}
                <TooltipHost content={"Add New"} id={tooltipId}>
                    <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                </TooltipHost>
                
                {/* Grid vs Card View Toggles */}
                <div className="grid-list-view">
                    <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`} onClick={() => handleViewChange("grid")}>
                        <TooltipHost content={"List View"} id={tooltipId}><FontAwesomeIcon icon="list" /></TooltipHost>
                    </Link>
                    <Link className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`} onClick={() => handleViewChange("card")}>
                        <TooltipHost content={"Card View"} id={tooltipId}><FontAwesomeIcon icon="th" /></TooltipHost>
                    </Link>
                </div>
            </div> : null
        }
    />
</div>
```

### Selection Logic Helper
```tsx
const _onItemSelected = (item: any): void => {
    if (item.length > 0) {
        if (item.length == 1) {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(true); // Show Edit
            setDeleteId(item[0].ID);
        } else {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(false); // Hide Edit for multiple
        }
        setisDisplayEDbtn(true); // Show Delete
    } else {
        setisSelectedData(false);
        setUpdateItem([]);
        setDeleteId(0);
        setisDisplayEDbtn(false); // Hide both
    }
};
```

### Custom Modal Logic (Validation & Delete Validation)
```tsx
{/* Validation Error Modal (Save/Edit issues) */}
<CustomModal 
    isModalOpenProps={hideDialog} 
    setModalpopUpFalse={() => { toggleHideDialog(); }} 
    subject={"Data Is Missing"} 
    message={returnErrorMessage() as any} 
    closeButtonText={"Close"} 
/>

{/* Delete Confirmation Modal */}
<CustomModal 
    isModalOpenProps={hideDialogdelete}
    setModalpopUpFalse={_closeDeleteConfirmation}
    subject={"Delete Item"}
    message={"This item will be deleted permanently, Are you sure, you want to delete it?"}
    yesButtonText="Yes"
    closeButtonText={"No"}
    onClickOfYes={onClickRealImageDelete} 
/>

{/* Success Message Modal (Saved / Updated Successfully) */}
<CustomModal 
    isModalOpenProps={isSuccessModalOpen} 
    setModalpopUpFalse={() => { closeSuccessModal(); }} 
    subject={"Success"} 
    message={"Data is saved/updated successfully."} 
    closeButtonText={"OK"} 
/>
```
