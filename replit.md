# Drug Management System

## Project Overview
A SharePoint Framework (SPFx) v1.20.0 web part built for pharmaceutical organizations to manage drug documentation, review workflows, and regulatory compliance. Runs inside Microsoft SharePoint / Microsoft 365.

For Replit development, the actual UI runs as a standalone React app (via CDN React) served by `server.js` on port 5000, using the project's real CSS files and mocked SharePoint data.

## Architecture
- **Framework**: SharePoint Framework (SPFx) v1.20.0
- **Frontend**: React 17, TypeScript 4.7, Fluent UI v8
- **State Management**: Jotai
- **SharePoint Data Access**: PnP.js v3
- **Build System**: Gulp + Webpack (SPFx pipeline), spfx-fast-serve for dev
- **Testing**: Playwright E2E
- **Package Manager**: npm
- **Replit Dev Server**: Node.js (`server.js`) serving standalone React UI on port 5000

## Replit Setup
The SPFx project requires Microsoft 365 to run natively. In Replit, `server.js` serves a standalone React preview using:
- React/ReactDOM via CDN (v17 UMD builds)
- The actual project CSS from `src/webparts/drugManagementSystem/components/Custom/styles/`
- Mocked SharePoint data that matches the real data structures
- All four user roles (Admin, Author, Reviewer, Approver) — switchable in the header

### Running
- **Workflow**: "Start application" runs `node server.js` on port 5000
- **Views**: Dashboard, All Documents, My Documents, Assigned to Me, Categories, Templates, Drugs Database, Reports, Manage Users

## Project Structure
```
src/webparts/drugManagementSystem/
  components/         - React components
    Common/           - Shared UI (Header, Footer, Dialogs, DataGrid, Toast, etc.)
    Custom/           - Role-specific views
      styles/         - app.css, ui-professional.css, enhanced-styles.css (used in Replit preview)
      components/Admin/   - AdminDashboard, ManageCategories, Templates, DrugsDatabase, Reports, CTDView
      components/Author/  - AuthorDashboard
      components/Approver/ - ApproverDashboard
      components/Reviewer/ - ReviewerDashboard
  services/           - SharePoint data provider layer
  jotai/              - Global state atoms
  loc/                - Localization strings
config/               - SPFx build configuration
e2e/ & tests/         - Playwright test suites
scripts/              - PowerShell deployment scripts (EnableAppCatalog.ps1, etc.)
server.js             - Replit standalone preview server (port 5000)
```

## User Roles
- **Admin** — full access: dashboard, all documents, categories, templates, drugs, reports, user management
- **Author** — create and submit drug documentation, view own documents
- **Reviewer** — review queue; approve for forwarding or return to author
- **Approver** — pending approval queue; approve or reject documents

## Key Dependencies
- `@microsoft/sp-webpart-base` 1.20.0 - SPFx base
- `@fluentui/react` ^8.106.4 - Fluent UI components
- `@pnp/sp` ^3.24.0 - SharePoint REST API client
- `jotai` ^2.8.0 - state management
- `recharts` / `echarts` - data visualization
- `exceljs`, `xlsx` - spreadsheet export
- `@playwright/test` - E2E testing

## SPFx Deployment (Microsoft 365)
1. `npm install` - install dependencies
2. `gulp bundle --ship` - production bundle
3. `gulp package-solution --ship` - create .sppkg file
4. Upload .sppkg to SharePoint App Catalog
5. Add the web part to a SharePoint page
