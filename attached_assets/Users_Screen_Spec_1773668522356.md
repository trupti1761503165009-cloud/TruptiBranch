# User Management - Screen Specification

This document provides a detailed breakdown of the Users management screen, with a specific focus on SharePoint Security Group synchronization.

## 1. Top Summary Cards
1. **Total Users**: Total unique users registered in the system.
2. **Active Users**: Users currently permitted to access the system.
3. **Pending / Inactive**: Users who are deactivated.

## 2. Grid View
- **Columns**: `Name`, `Email`, `Role` (Admin, HR, Users), `Status`.
- **Top Filters**: Standard Role dropdown filter (to filter by Admin, HR, Users) and Status dropdown filter showing above the grid next to the cards.
- **Actions**: Utilizes the standard `addEDButton` logic (Pen icon for Edit, Trash icon for Delete).

## 3. Form Controls & SharePoint Group Logic

When a user is added via the User Form, the app **must not** just write to a mundane SharePoint List. It must directly interact with backend SharePoint Security Groups to provision actual permissions.

### Form Field Bindings
| Control | Type | Dependency / Logic | Validation |
| :--- | :--- | :--- | :--- |
| **Name / Email** | People Picker | Queries actual AD/M365 accounts. | Required |
| **Role (Group)** | Dropdown | `Admin`, `HR`, `Users` | Required |
| **Status** | Dropdown | Active / Inactive | Required |

---

## 4. Strict External CRUD Operations (SharePoint Groups)

This screen manages the actual physical security access to the tool. Standard validation modals are implemented.

### 4.1 ADD User Flow
- When the Administrator clicks Save on the Add User form, the system evaluates the selected **Role**.
- **Admin**: Adds the user's M365 account to the Site's `Admin` Group.
- **HR**: Adds the user's M365 account to the Site's `HR` Group.
- **Users**: Adds the user's M365 account to the Site's `Users` Group.
- *Success Modal appears when backend confirms grouping success.*

### 4.2 EDIT User Flow
- When an Administrator edits a User and changes their Role (e.g., migrating a user from Users ➔ Admin).
- The system must programmatically **remove** the user from their old SharePoint Group, and **add** them to the newly selected SharePoint Group.

### 4.3 DELETE User Flow
- Triggers when an Administrator selects a user grid row and clicks the Trash icon.
- Standard CustomModal warning is displayed.
- On Confirm: The system executes SPfx calls to **remove that user's email entirely from all associated SharePoint Groups** (`Admin`, `HR`, or `Users`).
- *This revokes their access to the system physically.*

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
