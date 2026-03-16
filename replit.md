# Drug Management System

## Project Overview
A SharePoint Framework (SPFx) v1.20.0 web part built for pharmaceutical organizations to manage drug documentation, review workflows, and regulatory compliance. Designed to run inside Microsoft SharePoint / Microsoft 365.

## Architecture
- **Framework**: SharePoint Framework (SPFx) v1.20.0
- **Frontend**: React 17, TypeScript 4.7, Fluent UI v8
- **State Management**: Jotai
- **SharePoint Data Access**: PnP.js v3
- **Build System**: Gulp + Webpack (SPFx pipeline), spfx-fast-serve for dev
- **Testing**: Playwright E2E
- **Package Manager**: npm

## Project Structure
```
src/webparts/drugManagementSystem/
  components/         - React components
    Common/           - Shared UI components (Header, Footer, Dialogs, etc.)
    Custom/           - Role-specific views (Admin, Author, Approver, Reviewer)
  services/           - SharePoint data provider layer
  jotai/              - Global state atoms
  loc/                - Localization strings
config/               - SPFx build configuration
e2e/ & tests/         - Playwright test suites
scripts/              - PowerShell deployment scripts
_github_ref/          - Reference project (Quay Clean) for patterns
```

## Replit Setup
Since SPFx requires Microsoft 365 to run natively, a static Node.js preview server (`server.js`) is used to serve a project overview page on port 5000.

### Running Locally
- **Workflow**: "Start application" runs `node server.js` on port 5000
- The preview page explains the project and its SharePoint deployment requirements

### SPFx Deployment (Microsoft 365)
1. `npm install` - install dependencies
2. `gulp bundle --ship` - production bundle
3. `gulp package-solution --ship` - create .sppkg file
4. Upload .sppkg to SharePoint App Catalog
5. Add the web part to a SharePoint page

## Key Dependencies
- `@microsoft/sp-webpart-base` 1.20.0 - SPFx base
- `@fluentui/react` ^8.106.4 - Fluent UI components
- `@pnp/sp` ^3.24.0 - SharePoint REST API client
- `jotai` ^2.8.0 - state management
- `recharts` / `echarts` - data visualization
- `exceljs`, `xlsx` - spreadsheet export
- `@playwright/test` - E2E testing

## User Roles
- **Administrator** - system configuration and user management
- **Author** - create and submit drug documentation
- **Reviewer** - review and provide feedback on submissions
- **Approver** - approve or reject reviewed documents
