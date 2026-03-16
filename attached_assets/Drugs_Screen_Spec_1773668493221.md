# Drugs Database - Screen Specification

This document provides a detailed breakdown of the Drugs master management screen.

## 1. Top Summary Cards
To track drug lifecycle states, the screen includes 4 dynamic summary cards:
1. **Total Drugs**: Count of all entries.
2. **Active**: Count of finalized, active drugs available for mapping.
3. **In Development**: Drugs currently in the pipeline or draft phases.
4. **Inactive**: Drugs retired or archived.

## 2. Grid View & Filters (MemoizedDataGridComponent)
- **Columns**: `Drug Name`, `Category`, `Status`, `Description`.
- **Top Bar Controls**:
  - Global Search Box.
  - Status Filter (`All Status`, `Active`, `Inactive`, etc.).
  - "Add Drug" primary button.

## 3. Create / Edit Form Controls

A standard full-screen or large panel component to input generic drug metadata.

### Form Field Bindings
| Control | Type | Dependency / Logic | Validation |
| :--- | :--- | :--- | :--- |
| **Drug Name** | Textbox | The primary identifier for the drug. | Required |
| **Category** | Textbox / Dropdown | Generic classification text. | Optional |
| **Status** | Dropdown | Bound to `Active`, `Inactive`, `In Development`. | Required |
| **Description** | Textarea | General remarks / info. | Optional |

## 4. CRUD Operations & Validations
- **Strict Duplicate Prevention**: The system **must physically block** the creation of duplicate Active drugs. If a user attempts to save a drug with a `Drug Name` that exactly matches an existing record in the database, the `CustomModal` should throw a validation warning: *"This Drug Name already exists in the system."*
- **Delete**: The Delete Action (Trash icon) handles bulk deletions, but must evaluate if a given Drug has actively mapped Documents before allowing deletion to proceed.

---

## 5. Reference Code Snippets

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
