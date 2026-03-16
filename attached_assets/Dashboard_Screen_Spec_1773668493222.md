# Dashboard - Screen Specification

This document provides a detailed breakdown of the Dashboard screen, its UI layout, and functional behaviors.

## 1. Top Summary Cards
The dashboard requires 6 dynamic summary cards updating in real-time based on system data:
1. **Total Documents**: Count of all documents stored across all states in the system.
2. **Total Templates**: Count of all available baseline templates.
3. **Total Categories**: Count of all defined document master categories.
4. **Total Users**: Count of all active users in the system.
5. **Review Pending**: Count of documents currently awaiting Approver action (Status = `Pending Approval`).
6. **Approved Documents**: Count of documents successfully approved (Status = `Approved` or `Signed`).

## 2. Recent Documents Grid
Displays the Top 5 most recently created or modified documents in the system.
- **Columns**: `Document Name`, `Category`, `Author`, `Status`, `Last Modified`, `Actions`.
- **Filters/Controls**: Standard Search box and Page Length drop-down.
- **Actions (View Button)**:
  - Clicking the **View** icon (Eye) opens the specific Microsoft Word document inside a slide-out Panel.
  - **Panel Features**:
    - **History Button**: Triggers a version comparison. Instead of relying on a generic text box for comments, the system reads track-changes/comments natively added by users *inside* the Word document, showing the exact difference/history within the panel.
    - **Approve Button**: Approver action to progress the workflow.
    - **Reject Button**: Approver action to fail the workflow.

## 3. Recent Users Grid
Displays the Top 5 most active/recently added users in the system.
- **Columns**: `Name`, `Email`, `Role`, `Status`.
- **Filters/Controls**: Standard Search box and Page Length drop-down.
