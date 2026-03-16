# Category Management - Screen Specification

This document provides a detailed breakdown of the "Manage Categories" screen, its hierarchical structure, and data flow.

## 1. Components & Files
- **Main View**: `ManageCategories.tsx` (Drill-down Folder UI)
- **Data Hook**: `ManageCategoriesData.tsx` (Hierarchy management & Breadcrumbs)
- **Form View**: `AddCategoryPage.tsx` (Add/Edit form)
- **Form Hook**: `AddCategoryModalData.tsx` (Form logic)

## 2. Hierarchical Grid View (Folder Navigation)
The grid functions as a drill-down explorer with 4 levels:
1.  **Level 1: Document Category** (e.g., Governance and Procedures)
2.  **Level 2: Group** (e.g., Governance Document)
3.  **Level 3: Sub-Group** (e.g., Directive)
4.  **Level 4: Artifact Name** (e.g., Facility)

### Grid Features
- **Breadcrumbs**: Dynamic path tracking (Home > Category > Group > SubGroup).
- **Item Count**: Shows number of children at each level (e.g., "(2 items)").
- **Search**: Filters the current level only.

### Drill-down Navigation Flow
1. **Clicking a Folder/Row**: Navigates to the next hierarchical level.
2. **Icons**: Display a folder icon for parent nodes (Category, Group, SubGroup) and an element/file icon for the Artifact Name level.
3. **Empty Folder Handling**: If a user drills down to a folder (e.g., past Level 4) and there are no children mapped to it, the grid should display a message: **"No record found"** instead of an empty grid structure.

---

## 3. Cards & Filters

### Top Cards
- **Total Categories**: Count of all defined Document Categories.
- **Active Categories**: Total active level 1 nodes.
- **Inactive Categories**: Total inactive level 1 nodes.
- **Total Groups**: Count of all items at the Group level.

### Filters (Above Grid)
- **Document Category Filter**: Dropdown to filter the grid view to a specific Document Category.
- **Group Filter**: Dropdown to filter to a specific Group.
- **Status Filter**: Dropdown with `All Status`, `Active`, `Inactive`.

## 3. Create / Edit Category Form (Section Logic)

### Form Controls & Bindings
| Control | Type | Data source | Dependency / Logic | Validation |
| :--- | :--- | :--- | :--- | :--- |
| **Category Name** | Textbox | User Input | Final name of the artifact/node. | Required |
| **Document Category**| Dropdown | `Categories` List | Top-level parent. | Required |
| **Group** | Dropdown | `Groups` List | Filters based on selected Category. | Required |
| **Sub-Group** | Dropdown | `SubGroups` List | Filters based on selected Group. | Required |
| **Artifact Name** | Dropdown | `Artifacts` List | Final selection level. | Required |
| **Status** | Dropdown | Static | Active/Inactive. | Required |
| **CTD Module** | Dropdown | `CTD Folders` | eCTD Mapping reference. | Required |
| **eCTD Section** | Dropdown | `eCTD Sections` | Filters based on CTD Module. | Required |
| **Description** | Textarea | User Input | General category info. | Optional |

### Advanced Form Logic
- **Cascading Selects**: 
    - `Group` is disabled until `Document Category` is selected.
    - `SubGroup` is disabled until `Group` is selected.
    - `eCTD Section` is disabled until `CTD Module` is selected.
- **Duplicate Prevention**: System blocks creation if the same **Name** exists under the same parent hierarchy.
- **Dropdown Persistence**: Uses `Number()` conversion on `onChange` to ensure selection stability.

---

## 4. Lifecycle & Storage
- **Seeding**: Data is initially populated from the GMP Excel file.
- **Mapping**: Each Category/Artifact is mapped to an eCTD Section to allow cross-model visibility.
- **Edit/Delete**: Standard confirmation logic. Deleting a parent node is blocked if children exist.

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
