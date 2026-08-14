# Shelta Backend Product Requirements Document

## 1. Document Control

**Product:** Shelta Real Estate Management System  
**Component:** Backend API and data platform  
**Version:** 1.0  
**Status:** Draft for implementation  
**Architecture:** Modular NestJS monolith  
**Database:** PostgreSQL through Prisma ORM  
**Deployment:** Self-hosted, single organization per installation  

## 2. Product Purpose

Shelta is an internal agency platform for managing multiple landlords, their real estate portfolios, properties, units, tenants, leases, financial activity, maintenance, legal documents, staff permissions, communications, reporting, and audit history.

The backend is the source of truth for all records and authorization decisions. The frontend may hide or disable actions for usability, but the backend must independently authenticate every request, enforce permissions, and restrict landlord users to their own records.

## 3. Goals

* Provide secure authentication for agency employees and landlords.
* Enforce role-based and record-level authorization on every endpoint.
* Model landlords with multiple properties and properties with multiple units.
* Maintain complete tenant, lease, rent, transaction, maintenance, document, and communication histories.
* Provide agency-wide data for decisions and landlord-scoped data for workspace tabs.
* Provide a read-only landlord portal without exposing another landlord or agency-wide data.
* Preserve immutable audit records for sensitive and financial operations.
* Support reliable email delivery, file storage, report generation, and scheduled reminders.
* Provide a stable API contract for the existing Next.js frontend.

## 4. Non-Goals for Initial MVP

* Multi-organization SaaS billing.
* Online rent payment processing.
* Native mobile applications.
* WhatsApp or SMS delivery.
* Electronic signatures.
* OCR and AI forecasting.
* Full double-entry general ledger accounting.
* Contractor and tenant self-service portals.

The data model should not block future support for these features.

## 5. Users and Access Model

### 5.1 Agency Owner / Super Admin

* Full system access.
* Manage employees, roles, and permissions.
* Manage all landlords, properties, units, tenants, leases, documents, finances, and maintenance.
* View reports and immutable audit logs.
* Configure organization settings and integrations.

### 5.2 Property Manager

* Access only assigned properties unless granted broader scope.
* Manage tenants, units, leases, inspections, documents, maintenance, and permitted transactions.

### 5.3 Accountant

* Record and reconcile income and expenses.
* View properties, landlords, tenants, leases, and receipts as required.
* Generate and export financial reports.

### 5.4 Maintenance Officer

* View assigned properties and maintenance requests.
* Update request workflow, costs, reports, photos, and invoices.

### 5.5 Front Desk / Customer Support

* Register landlords and tenants.
* Schedule inspections.
* Create maintenance requests.
* Upload and send approved documents.

### 5.6 Landlord

* Read-only access to records owned by that landlord.
* View multiple owned properties, units, tenants, leases, financial summaries, expenses, maintenance, shared documents, reports, and activity.
* Download documents explicitly shared with landlords.
* Cannot create, update, or delete agency records in MVP.

## 6. Technical Architecture

### 6.1 Application Style

Use a modular NestJS monolith. Each business domain owns its controller, service, DTOs, policies, and tests. Shared infrastructure must not contain business rules.

Recommended source structure:

```text
src/
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
    types/
  config/
  database/
  auth/
  users/
  roles/
  landlords/
  properties/
  units/
  tenants/
  leases/
  finances/
  rent/
  maintenance/
  documents/
  communications/
  notifications/
  inspections/
  complaints/
  reports/
  audit/
  search/
  jobs/
```

### 6.2 Required Technology

* NestJS 11 and TypeScript.
* PostgreSQL.
* Prisma ORM and Prisma migrations.
* Class Validator and Class Transformer for request DTO validation.
* OpenAPI/Swagger for API documentation.
* Argon2id for password hashing.
* Secure HTTP-only cookie sessions or short-lived access tokens with rotating refresh tokens in HTTP-only cookies.
* Redis-backed BullMQ for email, reminders, exports, and other background work.
* S3-compatible object storage for documents, receipts, invoices, and photos.
* Structured application logging with request correlation IDs.

### 6.3 API Conventions

* Base path: `/api/v1`.
* JSON request and response bodies except multipart uploads and file downloads.
* UUID primary identifiers exposed to clients.
* Decimal or integer minor units for money; never JavaScript floating point persistence.
* ISO 8601 UTC timestamps.
* Cursor pagination for growing timelines and audit logs; page pagination is acceptable for bounded administrative tables.
* Standard error envelope with `code`, `message`, `details`, and `requestId`.
* Idempotency keys for payment recording, expense recording, email sending, and report generation.

## 7. Authentication Requirements

### 7.1 Login and Session Lifecycle

Required endpoints:

* `POST /auth/login`
* `POST /auth/refresh`
* `POST /auth/logout`
* `POST /auth/logout-all`
* `GET /auth/session`
* `POST /auth/forgot-password`
* `POST /auth/reset-password`
* `POST /auth/change-password`
* `POST /auth/invitations/:token/accept`

Session response must include:

* User ID.
* Name and email.
* User type: `AGENCY` or `LANDLORD`.
* Employee role and effective permissions when applicable.
* Assigned property IDs when access is restricted.
* Landlord ID for landlord users.
* Session expiration.

### 7.2 Security Controls

* Hash passwords with Argon2id.
* Never store raw access or refresh tokens.
* Store hashed refresh/session tokens with device metadata and expiration.
* Use `HttpOnly`, `Secure`, and appropriate `SameSite` cookie flags.
* Protect cookie-authenticated mutation endpoints against CSRF.
* Rate-limit login, reset, invitation, email, and export endpoints.
* Lock or delay repeated failed logins.
* Revoke sessions after password changes, suspension, or permission-critical account changes.
* Do not reveal whether an email exists during password reset.
* Record authentication events in audit logs.

## 8. Authorization Requirements

Authorization has three layers:

1. **User type:** agency or landlord.
2. **Permission:** action allowed on a resource.
3. **Record scope:** organization, assigned property, or owned landlord record.

Permission resources and actions:

* Properties: `view`, `create`, `edit`, `delete`.
* Units: `view`, `create`, `edit`, `delete`.
* Landlords: `view`, `create`, `edit`, `archive`.
* Tenants: `view`, `create`, `edit`, `delete`.
* Leases: `view`, `create`, `edit`, `terminate`, `renew`.
* Transactions: `view`, `create`, `edit`, `void`.
* Rent: `view`, `record`, `reconcile`.
* Reports: `view`, `export`.
* Documents: `view`, `upload`, `send`, `delete`.
* Maintenance: `view`, `create`, `assign`, `edit`, `verify`.
* Employees: `view`, `manage`.
* Audit: `view`.

Landlord rules:

* Every landlord query must include the authenticated landlord ID at database query time.
* Do not fetch broad data and filter it in application memory.
* Landlords must never access agency employees, roles, internal notes, unshared documents, other landlords, or agency-wide reports.
* Landlord mutation access is denied in MVP.

## 9. Core Domain Model

All mutable business tables should contain `id`, `createdAt`, `updatedAt`, and optimistic concurrency support where appropriate. Soft deletion should be used for business records that must remain historically traceable.

### 9.1 Organization

Fields:

* Name, legal name, email, phone, address, timezone, currency, and locale.
* Logo and document branding configuration.
* Email sender configuration.

Although each deployment initially serves one organization, domain records should carry `organizationId` to enforce ownership and permit future evolution.

### 9.2 User and Session

`User` fields:

* Email, password hash, name, phone.
* User type, status, email verification state.
* Employee profile ID or landlord ID.
* Last login and password change timestamps.

`Session` fields:

* User ID, hashed token, expiration, IP, user agent, revoked timestamp.

Additional models:

* Password reset token.
* Invitation token.
* Email verification token.

### 9.3 Employee, Role, and Permission

`Employee` fields:

* Department, role ID, status, phone, job title.
* Assigned properties through an explicit join table.

`Role` fields:

* Name, description, system-role indicator.

`Permission` fields:

* Resource and action with a unique compound key.

Join models:

* Role permission.
* Optional employee permission override with allow/deny effect.
* Employee property assignment.

### 9.4 Landlord

Fields:

* Name, email, phone, address.
* Bank details stored encrypted at the application layer.
* Emergency contact, identification metadata, notes.
* Portal status and linked user account.
* Active, archived, or suspended status.

Relationships:

* One landlord owns multiple properties.
* One landlord may have multiple agreements and documents.
* One landlord may have one portal user in MVP.

### 9.5 Property

Fields:

* Landlord ID, unique property code, name, type, address.
* State, city, latitude, longitude.
* Amenities as normalized records or validated JSON.
* Number of units derived from active unit records.
* Status: active, vacant, under maintenance, sold, archived.
* Assigned property managers.

Relationships:

* Landlord, units, documents, maintenance requests, inspections, transactions, activity events.

### 9.6 Unit

Fields:

* Property ID, unit number, floor, type.
* Bedrooms, bathrooms, monthly rent, security deposit.
* Status: occupied, vacant, reserved, under repair, archived.

Invariants:

* Unit number is unique within a property.
* One unit may have only one active lease at a time.
* Occupancy must be derived from active leases, not independently trusted client input.

### 9.7 Tenant

Fields:

* Full name, email, phone, identification metadata.
* Occupation, employer, emergency contact.
* Guarantor name and contact information.
* Status: active, former, notice given, archived.
* Internal notes protected by permission.

Relationships:

* Leases, payments, maintenance requests, complaints, notices, documents, communications.

### 9.8 Lease

Fields:

* Tenant ID, unit ID, start date, end date.
* Rent amount, security deposit, payment schedule.
* Status: draft, active, expiring, terminated, expired, renewed.
* Signed agreement document ID.
* Termination date and reason.

Invariants:

* Prevent overlapping active leases for one unit.
* Lease rent and deposit use PostgreSQL decimal or integer minor units.
* Lease changes that alter financial obligations must be audited.
* Renewal creates a new lease linked to the previous lease.

### 9.9 Rent Schedule and Payment Allocation

`RentCharge` fields:

* Lease ID, due date, amount due, status.
* Period start and end.

`Payment` fields:

* Tenant, landlord, property, unit, amount, date, method, reference, receipt document, notes.

`PaymentAllocation` fields:

* Payment ID, rent charge ID, allocated amount.

Rules:

* Support partial payments and allocation across charges.
* Derive paid and outstanding balances from allocations.
* Enforce unique external reference or idempotency key per organization.
* Never delete financial records; use reversal or void records with reason and audit event.

### 9.10 Financial Transaction

Fields:

* Type: income or expense.
* Category, amount, transaction date.
* Landlord, property, optional unit, optional tenant.
* Reference, payment method, receipt document, notes.
* Status: pending, completed, voided.
* Created by and voided by users.

Expense categories include repairs, cleaning, utilities, taxes, staff, and contractor payments. Income categories include rent, security deposits, penalties, and other income.

### 9.11 Maintenance Request

Fields:

* Property, optional unit, optional tenant.
* Category, title, description, priority.
* Status: open, assigned, in progress, completed, verified.
* Assigned employee or contractor description.
* Estimated and actual cost.
* Invoice document ID.
* Completed and verified timestamps and actors.

Relationships:

* Photos and documents.
* Status history records.
* Comments or updates.

Rules:

* Store every workflow transition with actor and timestamp.
* Completed work is not verified until an authorized user performs verification.
* Maintenance history remains attached to the property permanently.

### 9.12 Document and File Version

`Document` fields:

* Category, display name, description, status.
* Optional landlord, property, unit, tenant, lease, maintenance, inspection, or complaint relation.
* Created by, deleted/archived state.

`DocumentVersion` fields:

* Document ID, version number, storage key, original filename.
* MIME type, byte size, checksum, uploaded by, uploaded timestamp.

`DocumentGrant` fields:

* Document ID and audience: agency role, employee, landlord, or tenant.
* View and download permissions.

Rules:

* Use presigned upload/download URLs or streamed authorized endpoints.
* Never expose object storage keys as authorization.
* Validate MIME type, extension, size, and checksum.
* Scan uploads for malware before making them downloadable.
* Keep version history and audit upload, download, share, and deletion events.

### 9.13 Communication

Fields:

* Channel: email initially.
* Sender user, recipients, subject, body.
* Related landlord, tenant, property, lease, or maintenance request.
* Status: queued, sending, sent, failed.
* Provider message ID, sent timestamp, failure reason.
* Attached documents through a join table.

Rules:

* Queue delivery through BullMQ.
* Record communication before dispatch.
* Verify sender permission to access every recipient and attachment.
* Retry transient failures with bounded exponential backoff.
* Do not duplicate sends when an idempotency key is repeated.

### 9.14 Notification

Fields:

* Recipient user, type, title, body, link metadata.
* Read timestamp and created timestamp.

Notification triggers:

* Rent due or overdue.
* Lease expiring.
* Maintenance assigned or status changed.
* Payment received.
* Document shared.
* Inspection scheduled.

### 9.15 Inspection

Fields:

* Property, unit, tenant, inspection type.
* Inspector, scheduled date, completed date.
* Checklist response data, comments, signature metadata.
* Photos and final report document.

### 9.16 Complaint

Fields:

* Tenant, property, unit, category, title, description.
* Status: submitted, assigned, in progress, resolved, closed.
* Assignee, priority, timestamps.
* Conversation messages and attachments.

### 9.17 Audit Event

Fields:

* Organization, actor user, actor type.
* Action, resource type, resource ID.
* Timestamp, IP, user agent, request ID.
* Previous and new values with sensitive fields redacted.
* Optional reason.

Rules:

* Audit records are append-only and cannot be updated or deleted through the application API.
* Record authentication, authorization failures, permission changes, financial changes, document access, communications, and critical CRUD actions.

## 10. NestJS Modules and Responsibilities

### 10.1 Database Module

* Own the singleton Prisma service.
* Handle application shutdown and database disconnect.
* Expose transaction helpers.
* Provide test database utilities.

### 10.2 Auth Module

* Login, logout, refresh, password reset, invitation acceptance.
* Guards for authenticated users and user types.
* Session management and revocation.

### 10.3 Authorization Module

* Permission decorators and guards.
* Effective permission resolution.
* Property assignment and landlord ownership scope helpers.
* Deny by default.

### 10.4 Domain Modules

Landlords, properties, units, tenants, leases, finances, rent, maintenance, documents, communications, employees, roles, notifications, inspections, complaints, reports, audit, and search each own their business rules and API contracts.

### 10.5 Jobs Module

Background workers for:

* Email delivery.
* Rent charge generation.
* Due and overdue reminders.
* Lease expiration reminders.
* Report generation.
* File scanning and metadata extraction.

## 11. API Requirements by Domain

The list below describes the minimum API surface. Exact DTO names may differ, but behavior and authorization must remain.

### 11.1 Dashboard and Workspace

* `GET /dashboard/agency`
* `GET /dashboard/landlords/:landlordId`
* `GET /dashboard/attention`
* `GET /dashboard/schedule`

Agency dashboard returns cross-landlord attention, tasks, schedules, financial summaries, occupancy, and recent activity. Landlord dashboard returns the same categories scoped to one landlord.

### 11.2 Landlords

* `GET /landlords`
* `POST /landlords`
* `GET /landlords/:id`
* `PATCH /landlords/:id`
* `POST /landlords/:id/portal-invitation`
* `PATCH /landlords/:id/status`
* `GET /landlords/:id/timeline`

### 11.3 Properties and Units

* CRUD endpoints for properties and units.
* Property list supports landlord, status, city, type, and search filters.
* Unit list supports landlord, property, occupancy status, type, and search filters.
* Property detail includes units, documents, finances, maintenance, inspections, and timeline summaries.

### 11.4 Tenants

* CRUD endpoints for tenants.
* Filters for landlord, property, unit, lease status, payment status, and search.
* Tenant detail includes leases, payments, balances, maintenance, complaints, notices, documents, and communication history.

### 11.5 Leases

* Create, update draft, activate, renew, terminate, and retrieve leases.
* Upload and link signed agreements.
* List expiring leases.
* Generate future rent charges on activation and renewal.

### 11.6 Finances and Rent

* Record income, expense, payment, reversal, and allocation.
* List and retrieve transactions.
* Reconcile rent charges.
* Generate receipts.
* Generate agency and landlord statements.
* Filters include landlord, property, unit, tenant, type, category, date range, method, and status.

### 11.7 Maintenance

* Create and list requests.
* Assign request.
* Transition workflow with validation.
* Upload photos and invoices.
* Record estimated and actual cost.
* Verify completed work.

### 11.8 Documents

* Create document metadata.
* Request upload URL or upload through API.
* Add version.
* List by associated resource and access grant.
* Download authorized version.
* Share and revoke access.
* Archive document.

### 11.9 Communications

* Compose and queue email.
* Attach authorized documents.
* List communication history by tenant, landlord, property, or lease.
* Retry failed delivery when permitted.

### 11.10 Employees and Permissions

* List, invite, update, suspend, and reactivate employees.
* Assign role and properties.
* Manage role permissions and employee overrides.
* Changing permissions revokes or refreshes affected sessions.

### 11.11 Reports

* Agency portfolio performance.
* Landlord financial statement.
* Rent collection.
* Occupancy and vacancy.
* Maintenance cost.
* Tenant payment and lease status.
* PDF and Excel export jobs.

### 11.12 Landlord Portal

Portal endpoints may share domain controllers but must pass landlord policies:

* `GET /portal/me`
* `GET /portal/dashboard`
* `GET /portal/properties`
* `GET /portal/tenants`
* `GET /portal/finances`
* `GET /portal/maintenance`
* `GET /portal/documents`
* `GET /portal/reports`
* `GET /portal/timeline`

All portal endpoints are read-only in MVP.

## 12. Search

Global agency search covers landlords, properties, units, tenants, transactions, documents, leases, maintenance, and complaints.

Requirements:

* Enforce permission and assignment scope before returning results.
* Support entity type, landlord, property, and status filters.
* Start with PostgreSQL trigram and full-text indexes.
* Return compact typed results with deep-link metadata.
* Landlord search is limited to that landlord's records.

## 13. Reporting and Decision Data

Dashboard and reports must be derived from transactional data, not independently editable totals.

Required calculations:

* Occupancy from active leases and unit status.
* Expected rent from rent charges.
* Received rent from payment allocations.
* Outstanding rent from charge amount minus allocations and reversals.
* Income and expenses from completed, non-voided transactions.
* Net income from income minus expenses for the selected period.
* Maintenance cost from completed or approved cost records.
* Lease expiration from active lease end dates.

Use database aggregation for initial scale. Add summary tables or materialized views only after measurement demonstrates a need.

## 14. File Storage Requirements

* PostgreSQL stores metadata; object storage stores file bytes.
* Use private buckets only.
* Generate short-lived presigned URLs after authorization.
* Encrypt data in transit and at rest.
* Configurable maximum size by file category.
* Allowed formats include PDF, common image formats, and approved office documents.
* Store SHA-256 checksum for integrity and duplicate detection.
* Delete object bytes only after retention policy permits; archive metadata first.

## 15. Email Requirements

* Provider is configured through environment variables and an adapter interface.
* Support development providers such as Mailpit and production providers such as SMTP, SES, or Resend.
* Templates use organization branding.
* Attachments are copied or streamed only after access validation.
* Record queued, sent, delivered when provider supports it, and failed states.
* Store provider identifiers, but never provider secrets in the database.

## 16. Database Requirements

### 16.1 Prisma

* Use explicit relation names where ambiguity exists.
* Use enums for stable workflow states.
* Use `Decimal` or integer minor units for money.
* Add indexes for all foreign keys and common filters.
* Add unique compound constraints for unit number within property, role permission, document version, and payment idempotency.
* Use migrations committed to source control.
* Maintain seed data for default roles and permissions.

### 16.2 PostgreSQL Integrity

Use database constraints where Prisma supports them and SQL migrations for constraints Prisma cannot express safely, including:

* Positive monetary amounts.
* Lease end date after start date.
* Preventing duplicate active relationships where practical.
* Append-only audit protection through restricted database permissions or triggers.

### 16.3 Transactions

Use Prisma transactions for:

* Lease activation plus rent charge generation.
* Payment plus allocations plus receipt creation metadata.
* Transaction reversal.
* Maintenance completion plus financial expense linkage.
* Document metadata plus version creation.

## 17. Validation and Error Handling

* Enable a global NestJS validation pipe with whitelist and forbidden non-whitelisted fields.
* Reject unknown enum values and invalid date ranges.
* Return 404 for inaccessible records when revealing existence would leak data.
* Map Prisma errors to stable application error codes.
* Never expose stack traces, SQL, storage keys, tokens, or secrets to clients.
* Use a global exception filter and request ID.

## 18. Audit and Compliance

Audit at minimum:

* Authentication and session actions.
* Employee, role, and permission changes.
* Landlord, property, unit, tenant, and lease changes.
* Every financial create, edit, void, allocation, and reconciliation.
* Maintenance status and cost changes.
* Document upload, download, share, version, and archive.
* Email dispatch and retry.
* Report exports.

Sensitive values such as password hashes, tokens, full bank details, and file storage credentials must never be stored in audit payloads.

## 19. Observability and Operations

* Structured JSON logs in production.
* Request correlation IDs propagated to background jobs.
* Health endpoints for application, database, Redis, object storage, and email dependency checks.
* Metrics for request latency, error rates, queue depth, job failures, authentication failures, and database pool utilization.
* Graceful shutdown for HTTP server, Prisma, and job workers.
* Automated PostgreSQL backups with tested restore procedures.

## 20. Testing Requirements

### 20.1 Unit Tests

Test domain rules including:

* Permission resolution.
* Landlord and property scoping.
* Lease overlap prevention.
* Rent charge calculation.
* Payment allocation.
* Financial reversals.
* Maintenance transitions.
* Document grants.

### 20.2 Integration Tests

Use a real test PostgreSQL database for Prisma repositories and transactions.

### 20.3 End-to-End Tests

Critical flows:

* Employee login and session refresh.
* Landlord login and cross-landlord access denial.
* Add landlord, property, unit, and tenant.
* Activate lease and generate rent charges.
* Record partial and complete payments.
* Record and reverse an expense.
* Upload, version, share, and download a document.
* Send tenant email with an authorized attachment.
* Complete and verify maintenance.
* Generate landlord report.
* Permission denial for each restricted role.

## 21. Environment Configuration

Required environment categories:

* Application URL, API port, environment, and trusted proxy settings.
* PostgreSQL connection URL.
* Redis connection URL.
* Session or JWT signing secrets with rotation support.
* Cookie domain and security settings.
* Object storage endpoint, bucket, region, and credentials.
* Email provider configuration.
* Frontend origin and CORS allowlist.
* Upload size limits and allowed MIME types.
* Logging and monitoring configuration.

Validate configuration at startup and fail fast when required values are missing. Never commit real secrets.

## 22. Delivery Phases

### Phase 1: Foundation

* Prisma and PostgreSQL setup.
* Configuration validation.
* Database module and migrations.
* Users, authentication, sessions, roles, permissions, guards, and audit foundation.
* Organization seed and default roles.

### Phase 2: Portfolio Records

* Landlords, properties, units, tenants.
* Property assignments and scoped queries.
* Agency and landlord workspace endpoints.

### Phase 3: Leases and Rent

* Leases, renewals, terminations.
* Rent charges, payments, allocations, receipts, and reconciliation.
* Financial transactions and landlord statements.

### Phase 4: Operations

* Maintenance workflow and history.
* Documents, versions, grants, and object storage.
* Email communications and background jobs.
* Notifications and reminders.

### Phase 5: Visibility

* Reports and exports.
* Search.
* Activity timelines.
* Read-only landlord portal APIs.

### Phase 6: Extended PRD Modules

* Inspections.
* Complaints and queries.
* Advanced audit review and system settings.

## 23. MVP Acceptance Criteria

The backend MVP is complete when:

* Agency employees and landlords authenticate securely.
* Backend authorization rejects disallowed actions independent of the frontend.
* A landlord can never retrieve another landlord's records.
* Agency users can manage multiple landlords and scope operations by landlord.
* Properties, units, tenants, and leases are persistent and relationally correct.
* Rent charges, partial payments, expenses, balances, receipts, and statements are calculated consistently.
* Maintenance follows the required workflow with permanent history.
* Legal documents support private storage, versions, grants, and authorized delivery.
* Tenant email is queued, auditable, and idempotent.
* Reports and dashboards derive from source records.
* Critical actions create immutable audit events.
* Unit, integration, and end-to-end tests cover security and financial flows.
* API documentation describes all public endpoints and DTOs.

## 24. Success Metrics

* Zero cross-landlord data exposure in automated authorization tests.
* Zero un-audited financial mutations.
* Successful reconciliation between rent charges, allocations, and displayed balances.
* Reliable email job processing with visible failure state and retry.
* Document downloads always require current authorization.
* Dashboard and report calculations match database source records.
* API response times remain acceptable for the expected single-agency workload.
