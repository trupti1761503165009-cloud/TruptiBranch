# Drug Management System - Complete Implementation Plan

## Current State Analysis

Based on the PRD.md and codebase review, the following is already implemented:
- Project structure with SPFx v1.20, React, TypeScript, Fluent UI v8, Jotai
- Main navigation shell with role-based views (Admin, Author, Approver, Reviewer, HR)
- AdminDashboard with stats cards and recent documents/users grids
- ManageDocuments with drug folder hierarchy, breadcrumb navigation, filters, and document view panel
- ManageTemplates with summary cards, filters, upload/edit functionality, and preview panel
- UI components: DataGrid, CustomModal, MessageDialog, ReactDropdown, Loader
- Mock data hooks for development

**Critical Gap:** Data fetching from SharePoint lists is not fully implemented - dropdowns are empty and real data isn't loading.

---

## Phase 1: Foundation - SharePoint Data Layer (P0 - Critical)

### 1.1 SharePoint Service Layer Enhancement
**Files to modify:**
- `src/webparts/Service/Service.ts`
- `src/webparts/Service/pnpServices.ts`

**Implementation:**
- Complete all CRUD operations for each list/library
- Implement proper error handling and loading states
- Add batch operations for bulk actions

```typescript
// Required methods to implement in Service.ts:
- getCategories(): Promise<ICategory[]>
- createCategory(data: ICategory): Promise<ICategory>
- updateCategory(id: number, data: Partial<ICategory>): Promise<void>
- deleteCategory(id: number): Promise<void>

- getDrugs(): Promise<IDrug[]>
- createDrug(data: IDrug): Promise<IDrug>
- updateDrug(id: number, data: Partial<IDrug>): Promise<void>
- deleteDrug(id: number): Promise<void>

- getCTDFolders(): Promise<ICTDFolder[]>
- createCTDFolder(data: ICTDFolder): Promise<ICTDFolder>
- updateCTDFolder(id: number, data: Partial<ICTDFolder>): Promise<void>
- deleteCTDFolder(id: number): Promise<void>

- getTemplates(): Promise<ITemplate[]>
- uploadTemplate(file: File, metadata: ITemplate): Promise<ITemplate>
- updateTemplate(id: number, data: Partial<ITemplate>): Promise<void>
- deleteTemplate(id: number): Promise<void>

- getDocuments(): Promise<IDocument[]>
- createDocument(data: IDocument): Promise<IDocument>
- updateDocument(id: number, data: Partial<IDocument>): Promise<void>
- deleteDocument(id: number): Promise<void>

- getWorkflowApprovals(): Promise<IWorkflowApproval[]>
- createWorkflowApproval(data: IWorkflowApproval): Promise<IWorkflowApproval>
- updateWorkflowApproval(id: number, data: Partial<IWorkflowApproval>): Promise<void>

- getUsers(): Promise<IUser[]>
- getUserGroups(userId: number): Promise<string[]>
```

### 1.2 Data Hooks Implementation
**Files to create/modify:**
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/ManageCategories/ManageCategoriesData.tsx`
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/DrugsDatabase/DrugsDatabaseData.tsx`
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/CreateCTDFolder/CreateCTDFolderData.tsx`
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/UserPermissions/UserPermissionsData.tsx`
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/Reports/ReportsData.tsx`
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/ManageTemplates/ManageTemplatesData.tsx` (enhance)
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/ManageDocuments/ManageDocumentsData.tsx` (enhance)
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/AdminDashboard/AdminDashboardData.tsx` (enhance)

**Pattern for each Data.tsx hook:**
```typescript
export const ComponentNameData = () => {
  const appState = useAtomValue(appGlobalStateAtom);
  const [items, setItems] = React.useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await appState.provider.getItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [appState.provider]);
  
  React.useEffect(() => { void loadData(); }, [loadData]);
  
  return { items, isLoading, error, loadData, /* other methods */ };
};
```

---

## Phase 2: Admin Modules Completion (P0)

### 2.1 Manage Categories Module
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/ManageCategories/ManageCategories.tsx`

**Current State:** Nearly empty (0.1KB)
**Required Implementation:**
- Summary cards (Total Categories, Active, Inactive, Document Categories)
- Filters section (Status filter, Reset button)
- Hierarchical grid showing Category -> Group -> SubGroup -> Artifact
- Breadcrumb navigation for hierarchy drill-down
- Add/Edit/View form page (not panel) with cascading dropdowns
- Excel upload functionality
- Delete with confirmation

**Key Features:**
- Cascading dropdowns: Category -> Group -> SubGroup -> Artifact
- Disabled states when parent not selected
- Red border validation for required fields
- MessageDialog for validation errors

### 2.2 Drugs Database Module
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/DrugsDatabase/DrugsDatabase.tsx`

**Current State:** Empty (0.0KB)
**Required Implementation:**
- Summary cards (Total Drugs, Active, Inactive, By Category)
- Filters section (Status, Category filters)
- Grid with drug information
- Add/Edit/View Panel with ms-Grid form layout
- Form fields: Drug Name, Category, Status, Description, Created Date

### 2.3 Create CTD Folder Module
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/CreateCTDFolder/CreateCTDFolder.tsx`

**Current State:** Nearly empty (0.1KB)
**Required Implementation:**
- Hierarchical tree view of CTD/eCTD folder structure
- Add/Edit/View Panel for folder management
- Form fields: Folder Name, Parent Folder, Sort Order, IsFolder flag
- Drag-and-drop reordering support

### 2.4 User Permissions Module
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/UserPermissions/UserPermissions.tsx`

**Current State:** Nearly empty (0.1KB)
**Required Implementation:**
- Role summary cards (Admin count, HR count, Author count, Approver count)
- Grid showing users with their SharePoint Group memberships
- Role filter dropdown
- View permissions summary in Panel
- Add/Edit user role assignments

### 2.5 Reports Module
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/Reports/Reports.tsx`

**Current State:** Empty (0.0KB)
**Required Implementation:**
- KPI Summary Cards (Total, Draft, Pending, Approved, Rejected, Approval Rate)
- Pivot tabs: Overview, Trends, Workflow
- Charts using Recharts:
  - Status Distribution Bar Chart
  - Category Distribution Pie Chart
  - Monthly Trend Area Chart with gradients
  - Workflow Funnel visualization
  - Approval Rate gauge
- Export to Excel/PDF buttons
- Table view toggle

---

## Phase 3: Document Workflow Implementation (P0)

### 3.1 Document Creation Wizard
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Admin/CreateDocumentPage/DocumentCreationWizard.tsx`

**Current State:** Exists (15.7KB) - needs integration with SharePoint data
**Required Enhancements:**
- Populate dropdowns from SharePoint: Drugs, Categories, Templates, CTD Folders, Approvers
- 2-column layout using ms-Grid
- File upload with validation
- Form validation with red borders
- MessageDialog for errors
- Submit creates document in Draft status

### 3.2 Document Workflow States
**Files:**
- `src/webparts/drugManagementSystem/components/Custom/components/Admin/ManageDocuments/ManageDocumentsData.tsx`

**Workflow Implementation:**
```
Draft (Author) -> Submit -> Pending Approval (Creates Workflows Approvals record)
Pending Approval -> Approver Reviews -> Approve -> Signed/Final
Pending Approval -> Approver Reviews -> Reject -> Rejected (with comments)
Rejected -> Author Updates -> Resubmit -> Pending Approval (new cycle)
Signed -> Final Approval -> Final (generates Final-Signed and Commented versions)
```

**Required Methods:**
- `submitForApproval(documentId: number, approverId: number): Promise<void>`
- `approveDocument(documentId: number, comments: string): Promise<void>`
- `rejectDocument(documentId: number, comments: string): Promise<void>`
- `generateSignedVersions(documentId: number): Promise<void>`

### 3.3 Author Dashboard
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Author/AuthorDashboard.tsx`

**Required Implementation:**
- "My Requests" tab showing author's documents
- Document status tracking
- Edit draft documents
- Resubmit rejected documents
- View final signed documents

### 3.4 Approver Dashboard
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Approver/ApproverDashboard.tsx`

**Required Implementation:**
- "Pending Approvals" queue
- Document review panel with preview
- Approve/Reject actions with comments
- eSignature capture for final approval

### 3.5 Reviewer Dashboard
**File:** `src/webparts/drugManagementSystem/components/Custom/components/Reviewer/ReviewerDashboard.tsx`

**Required Implementation:**
- "Review Queue" showing documents assigned for review
- Document preview and comments
- Submit review feedback

---

## Phase 4: Shared Components & Utilities (P1)

### 4.1 Common Components Enhancement
**Files:**
- `src/webparts/drugManagementSystem/components/Common/DetailList/DataGridComponent.tsx` - Ensure sorting, pagination, selection work
- `src/webparts/drugManagementSystem/components/Common/Dialogs/MessageDialog.tsx` - Already exists, verify integration
- `src/webparts/drugManagementSystem/components/Common/CustomModal.tsx` - Verify all modal types work

### 4.2 Validation Utilities
**File:** `src/webparts/drugManagementSystem/components/Shared/Validation.ts`

**Required Validators:**
- Required field validation
- Email validation
- Date range validation
- File type validation
- Custom validation rules

### 4.3 File Utilities
**File:** `src/webparts/drugManagementSystem/components/Custom/utils/fileIconHelper.ts`

**Already exists** - verify it handles all required file types (PDF, Word, Excel, etc.)

---

## Phase 5: SharePoint List Schema Setup (P0)

### 5.1 Required SharePoint Lists/Libraries

**DMS Documents (Document Library)**
- Columns: Title, Status (Choice), Drug (Lookup), Category (Lookup), Template (Lookup), CTDFolder (Lookup), Approver (Person), Reviewer (Person), Comments (Note), Version

**Workflows Approvals (Custom List)**
- Columns: Document (Lookup), RequestedBy (Person), Approver (Person), Decision (Choice), DecisionComment (Note), RequestedOn (Date), DecidedOn (Date), Cycle (Number)

**Signed Documents (Document Library)**
- Columns: OriginalDocument (Lookup), DocumentType (Choice: Final-Signed, Commented), SignedBy (Person), SignedOn (Date)

**Templates (Document Library)**
- Columns: Category (Lookup), Country (Lookup), MappedCTDFolder (Lookup), eCTDSection (Lookup), eCTDSubsection (Text), Status (Choice), MappingType (Choice)

**CTD Folders (Custom List)**
- Columns: FolderId (Text), ParentFolderId (Text), SortOrder (Number), IsFolder (Yes/No)

**Categories (Custom List)**
- Columns: Name, ParentCategory (Lookup), Level (Number: 1=Category, 2=Group, 3=SubGroup, 4=Artifact), Status

**Drugs Database (Custom List)**
- Columns: DrugName, Category (Lookup), Status, Description

**Employees (Custom List)**
- Columns: Name, Email, Department (Lookup), Role

**User Roles Permissions (Custom List)**
- Columns: User (Person), Role (Choice), Permissions (Multi-choice)

---

## Phase 6: Testing & Quality Assurance (P1)

### 6.1 Unit Tests
**Pattern for each component:**
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByTestId('button-id'));
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### 6.2 Integration Tests
- End-to-end document workflow
- CRUD operations for each module
- Role-based access control
- Data fetching and state management

### 6.3 Accessibility Testing
- Verify all interactive elements have data-testid
- Keyboard navigation works
- Screen reader compatibility
- Color contrast compliance

---

## Phase 7: Deployment Preparation (P1)

### 7.1 Build Configuration
**Files:**
- `config/package-solution.json` - Verify solution package settings
- `config/deploy-azure-storage.json` - Configure CDN deployment
- `gulpfile.js` - Verify build tasks

### 7.2 Production Build
```bash
gulp bundle --ship
gulp package-solution --ship
```

### 7.3 Deployment Steps
1. Deploy .sppkg to SharePoint App Catalog
2. Add app to site
3. Configure SharePoint lists with required columns
4. Set up security groups (DMS Admins, DMS HR, DMS Members, DMS Approvers)
5. Add web part to page

---

## Implementation Order Recommendation

**Week 1: Foundation**
1. Complete Service.ts with all CRUD operations
2. Implement data hooks for all modules
3. Set up SharePoint lists

**Week 2: Admin Modules**
4. Complete ManageCategories
5. Complete DrugsDatabase
6. Complete CreateCTDFolder
7. Complete UserPermissions
8. Complete Reports

**Week 3: Document Workflow**
9. Complete DocumentCreationWizard integration
10. Implement workflow state transitions
11. Complete AuthorDashboard
12. Complete ApproverDashboard
13. Complete ReviewerDashboard

**Week 4: Testing & Polish**
14. Fix any remaining bugs
15. Add data-testid attributes
16. Performance optimization
17. Build and deploy

---

## Key Technical Decisions

1. **State Management:** Jotai for global state, React useState for local component state
2. **Data Fetching:** Custom hooks (Data.tsx pattern) with useCallback for memoization
3. **UI Components:** Fluent UI v8 exclusively, ms-Grid for layouts
4. **Forms:** Controlled components with validation, red borders for errors
5. **Notifications:** MessageDialog component (replaces toasts)
6. **File Icons:** FontAwesome with custom FileIconHelper utility
7. **Charts:** Recharts for Reports module

---

## Success Criteria

- All dropdowns populate from SharePoint data
- CRUD operations work for all modules
- Document workflow functions end-to-end
- Role-based navigation shows correct items
- All forms validate properly
- Reports display accurate charts
- Build succeeds without errors
- Deploys and runs in SharePoint environment