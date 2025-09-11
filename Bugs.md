# Bugs and Enhancements Report

## Critical Bugs

- **No Real Issue Sync in Escalation**
  - *File/Component*: `src/pages/Escalation.tsx`, `src/components/IssuesTracker.tsx`
  - *Description*: IssuesTracker uses mock issues, not live Supabase data. Escalation management is not in sync with the real DB.
  - *Next Step*: Refactor IssuesTracker to fetch and update issues from Supabase.

- **Potential Data Loss on Project Add/Edit**
  - *File/Component*: `src/pages/Projects.tsx`
  - *Description*: No validation for required fields (e.g., name, status) when adding/editing projects. Could result in incomplete or broken records.
  - *Next Step*: Add robust form validation and error handling.

- **No RLS Policy Checks**
  - *File/Component*: All Supabase hooks
  - *Description*: If RLS is enabled but not configured, all DB reads/writes will fail with 406/403 errors. No fallback or user feedback.
  - *Next Step*: Add user-facing error messages and check for RLS policy issues.

## Major Bugs

- **Blockers/Deliverables Always Zero in Some Views**
  - *File/Component*: `src/pages/Projects.tsx`, `src/pages/Resources.tsx`, `src/pages/Escalation.tsx`
  - *Description*: Blockers, deliverables, team size, etc. are hardcoded to 0 in some project transforms, so UI is misleading.
  - *Next Step*: Calculate these values from live Supabase data everywhere.

- **NaN/Undefined in ExecutiveSummary/Overview**
  - *File/Component*: `src/components/ExecutiveSummary.tsx`, `src/pages/Overview.tsx`
  - *Description*: Division by zero or missing data can cause NaN or undefined in health metrics and progress bars.
  - *Next Step*: Add defensive checks for zero/undefined/null.

- **No Error Boundaries**
  - *File/Component*: App-wide
  - *Description*: Uncaught errors in hooks/components can crash the app. No error boundary or fallback UI.
  - *Next Step*: Add React error boundaries at the app and page level.

- **No Real-Time Sync for Allocations/Employees**
  - *File/Component*: `src/components/ResourceAllocation.tsx`, `src/components/EmployeesList.tsx`
  - *Description*: If two users edit allocations/employees at once, UI may show stale data until manual refresh.
  - *Next Step*: Add refetch or real-time listeners after updates.

## Minor Bugs

- **Console Errors Not Surfaced to User**
  - *File/Component*: All hooks/pages
  - *Description*: Many errors are only logged to console, not shown to user.
  - *Next Step*: Show toast or alert for all major errors.

- **Fallbacks for Null/Empty Data**
  - *File/Component*: All list/detail UIs
  - *Description*: Some UIs show 'Unknown' or empty fields, but others may break or show nothing if data is missing.
  - *Next Step*: Add consistent fallbacks for all fields.

- **Legacy/Unused Fields in Project Transforms**
  - *File/Component*: `src/pages/Projects.tsx`, `src/pages/Resources.tsx`
  - *Description*: Some fields (e.g., teamSize, blockers) are always 0 or empty, which is misleading.
  - *Next Step*: Remove or replace with real data.

- **No Pagination or Virtualization for Large Lists**
  - *File/Component*: Employees, Projects, Issues lists
  - *Description*: Large lists may cause performance issues.
  - *Next Step*: Add pagination or virtualization for large datasets.

## UI Enhancements

- **Show Real Last Call Date on Project Cards**
  - *File/Component*: `src/components/ProjectCard.tsx`
  - *Description*: Last call date is now tracked, but not always shown or editable in all views.
  - *Next Step*: Show and allow editing last call date everywhere relevant.

- **Better Loading/Empty States**
  - *File/Component*: All list/detail UIs
  - *Description*: Some pages show only a spinner or blank state when empty.
  - *Next Step*: Add friendly empty state messages and illustrations.

- **Consistent Status/Color Coding**
  - *File/Component*: All status badges/selects
  - *Description*: Status colors and labels are not always consistent across components.
  - *Next Step*: Standardize status color and label usage.

- **Accessibility Improvements**
  - *File/Component*: All interactive UIs
  - *Description*: Some buttons, selects, and popovers may lack ARIA labels or keyboard support.
  - *Next Step*: Audit and improve accessibility for all controls.

---

*This report is based on a line-by-line and pattern-based review of the codebase as of the latest snapshot. Some issues may require deeper runtime or user testing to fully uncover.* 