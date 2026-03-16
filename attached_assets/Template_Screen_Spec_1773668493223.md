# Template Management - Screen Specification

This document provides a detailed breakdown of the "Manage Templates" screen, its components, logic, and data flow.

## 1. Components & Files
- **Main View**: `ManageTemplates.tsx` (Grid & Cards UI)
- **Data Hook**: `ManageTemplatesData.tsx` (Grid fetching & filtering)
- **Form View**: `UploadTemplatePage.tsx` (Add/Edit form UI)
- **Form Hook**: `UploadTemplateModalData.tsx` (Form state & submission)

## 2. Upload / Edit Template Form

### Form Controls & Bindings
| Control | Type | Data source | Dependency / Logic | Validation |
| :--- | :--- | :--- | :--- | :--- |
| **Template Name** | Textbox | User Input | Used for file naming. | Required |
| **Version No.** | Textbox | User/Auto | e.g., `1.0`, `2.0`. Tracks revision. | Required |
| **Country** | Dropdown | `Countries` List | Binds to ID and Title. | Required |
| **Status** | Dropdown | Static | Options: `Active`, `Inactive`. | Default: `Active` |
| **Mapping Type** | Dropdown | Static | Options: `None`, `eCTD`, `GMP`, `TMF`. | Required |

### Advanced Logic
- **Duplicate Check**: Before saving, the system checks the library for an existing file with the same Name AND Version. If found, it blocks upload with an error message: *"Template with this name and version already exists."*
- **Dropdown Fix (OnChange)**: All lookup values are force-casted to `Number()` during `onChange` and stored in state to ensure they remain selected in the UI.

### Dynamic Mapping Logic (Cascading)
| If Mapping Type is... | Show these controls | Data Source | Logic |
| :--- | :--- | :--- | :--- |
| **eCTD** | `Mapped CTD Folder`, `eCTD Section`, `Subsection` | `CTD Folders` & `eCTD Sections` lists | Disable Section if Folder is empty. |
| **GMP** | `Mapped GMP Model` | `GMP Models` List | Single level lookup. |
| **TMF** | `Mapped TMF Folder` | `TMF Folders` List | Single level lookup (Zone mapping). |

### Validations
1. **Required**: Name, Version, Country, Mapping Type.
2. **Conditional**: If `eCTD` is selected, `CTD Folder` and `Section` become mandatory.
3. **File**: `.docx` or `.pdf` must be selected for new uploads.

---

## 3. Template Grid (Display)

### Columns
- **Template Name**: File icon + Filename.
- **Version**: Version number (e.g. `v1.0`).
- **Country**: Name of the country.
- **Mapping Type**: Badge showing `TMF`, `eCTD`, or `GMP`.
- **Folder / Zone**: 
  - *eCTD*: Module Name
  - *TMF*: Zone Name
  - *GMP*: Category Name
- **Section / Model**:
  - *eCTD*: Section ID
  - *TMF*: Artifact Name
  - *GMP*: Model Name
- **Upload Date**: `DD-MM-YYYY`.
- **Status**: Toggle or label (Active/Inactive).
- **Actions**: Edit (Icon), Delete (Icon), View (Preview).

---

## 4. Cards & Filters

### Top Cards
- **Total Templates**: Total count.
- **eCTD Templates**: Total mapped to eCTD.
- **GMP Templates**: Total mapped to GMP.
- **TMF Templates**: Total mapped to TMF.

### Filters
- **Global Search**: Search by name or country.
- **Mapping Type Filter**: Dropdown with `All`, `eCTD`, `GMP`, `TMF`.
- **Date Range Filter**: From Date and To Date pickers.
- **Status Filter**: Dropdown with `All Status`, `Active`, `Inactive`.

---

## 5. Storage & Folder Logic
- When "Save" is clicked:
  1. The file is uploaded to the **Templates** library.
  2. Metadata (Country, Mapping, IDs) is stored alongside the file.
- **No Manual Folders**: Library remains flat or follows mapping metadata.
- **Cascading Fix**: When selecting `Folder`, the `Section` options are filtered (if applicable) and values are stored as **Numbers** to prevent the "Not Selected" bug.

---

## 6. Edit / Delete / View Lifecycle
1. **Edit**: Opens the `UploadTemplatePage` with `editMode={true}`. All fields are pre-populated.
2. **Delete**: Shows a standard confirmation modal. On confirm, the item's `IsDelete` flag is set to true in SharePoint, and the record is hidden from the grid view (logical delete).
3. **View**: Opens a side panel or modal to show File Preview (via Office Online) and full metadata details.

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
