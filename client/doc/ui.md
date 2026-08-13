# Product Requirements Document (PRD)

## Real Estate Management System (Internal Property Management Platform)

**Version:** 1.0
**Status:** Draft
**Product Type:** Internal Web Application
**Target Users:** Real Estate Agencies, Property Managers, Landlords, Employees
**Deployment:** Self-hosted (Single Organization)
**Business Model:** Internal Business Software (Not SaaS)

---

# 1. Product Overview

The Real Estate Management System is an internal business platform designed for real estate agencies that manage properties on behalf of multiple landlords.

The platform centralizes every aspect of property management into one system, replacing scattered spreadsheets, WhatsApp conversations, paper documents, and manual bookkeeping.

Its primary objective is to create complete transparency between landlords and property managers while improving operational efficiency inside the agency.

The platform enables agencies to manage:

* Multiple landlords
* Multiple properties
* Multiple tenants
* Rental agreements
* Financial transactions
* Maintenance requests
* Property documentation
* Employee permissions
* Reporting & analytics

Each landlord has visibility into only their own properties while agency employees have role-based access according to their responsibilities.

---

# 2. Goals

## Business Goals

* Reduce manual paperwork
* Digitize property management
* Build trust between landlords and agencies
* Improve accountability
* Track every financial movement
* Increase operational efficiency
* Reduce tenant management errors
* Store documents securely
* Create historical records for every property

---

## User Goals

### Agency

* Manage all landlords
* Track all income and expenses
* Assign employees
* Monitor operations
* Generate reports

### Landlord

* View owned properties
* Monitor rental income
* Track expenses
* Access documents
* View tenants
* Monitor maintenance
* View analytics

### Employees

* Perform assigned duties
* Upload documents
* Manage tenants
* Record transactions
* Handle maintenance
* Communicate internally

---

# 3. User Roles

## Super Admin

Agency owner.

Permissions

* Full system access
* Create employees
* Manage permissions
* Manage landlords
* Manage properties
* View analytics
* Financial oversight
* Audit logs
* System settings

---

## Property Manager

Responsible for managing assigned properties.

Permissions

* Manage tenants
* Manage leases
* Upload documents
* Record inspections
* Record maintenance
* Record transactions
* View assigned landlords

---

## Accountant

Permissions

* Record payments
* Record expenses
* Generate financial reports
* Rent reconciliation
* Track outstanding balances

---

## Maintenance Officer

Permissions

* Receive maintenance requests
* Update repair status
* Upload repair reports
* Upload invoices

---

## Customer Support / Front Desk

Permissions

* Register tenants
* Register landlords
* Schedule inspections
* Create maintenance tickets

---

## Landlord

Limited portal.

Permissions

* View owned properties
* View rent history
* View tenants
* Download documents
* Track expenses
* View maintenance
* View reports

Cannot modify records.

---

# 4. Core Modules

---

# Module 1 — Dashboard

Agency dashboard includes:

* Occupancy rate
* Vacant properties
* Total landlords
* Total tenants
* Expected rent
* Rent received
* Outstanding rent
* Monthly revenue
* Monthly expenses
* Maintenance requests
* Lease renewals
* Expiring agreements
* Recent activities

---

# Module 2 — Landlord Management

Features

Create landlord

Fields

* Name
* Phone
* Email
* Address
* Bank details
* Emergency contact
* Identification
* Notes

Capabilities

* View owned properties
* Financial history
* Agreements
* Documents
* Reports
* Communication history

---

# Module 3 — Property Management

Each landlord may own multiple properties.

Property information

* Property name
* Property code
* Type
* Address
* State
* City
* GPS location
* Photos
* Floor plans
* Amenities
* Number of units
* Current occupancy

Property status

* Active
* Vacant
* Under Maintenance
* Sold
* Archived

---

# Module 4 — Unit Management

Each property contains units.

Fields

* Unit number
* Floor
* Type
* Bedrooms
* Bathrooms
* Monthly rent
* Security deposit
* Status

Status

* Occupied
* Vacant
* Reserved
* Under Repair

---

# Module 5 — Tenant Management

Tenant Profile

Information

* Full name
* Contact
* Identification
* Occupation
* Employer
* Guarantor
* Emergency contact
* Documents

Rental information

* Assigned property
* Assigned unit
* Lease period
* Rent amount
* Deposit
* Payment schedule

History

* Previous payments
* Complaints
* Maintenance
* Notices
* Documents

---

# Module 6 — Lease Management

Manage tenancy agreements.

Features

* Create lease
* Upload signed agreement
* Renewal tracking
* Lease expiration reminders
* Termination
* Renewal history

Documents

* Lease agreement
* Inventory list
* Inspection report

---

# Module 7 — Financial Management

Income

* Rent payment
* Security deposit
* Penalties
* Other income

Expenses

* Repairs
* Cleaning
* Utilities
* Taxes
* Staff expenses
* Contractor payment

Every transaction contains

* Amount
* Date
* Property
* Unit
* Landlord
* Tenant
* Category
* Reference
* Payment method
* Receipt
* Notes

---

# Module 8 — Rent Collection

Features

Track

* Due rent
* Paid rent
* Outstanding rent
* Partial payments
* Late payments

Support

* Monthly rent
* Quarterly
* Yearly
* Custom schedules

Generate

* Receipts
* Statements
* Payment history

---

# Module 9 — Maintenance Management

Tenant creates maintenance request.

Fields

* Property
* Unit
* Category
* Description
* Photos
* Priority

Workflow

Open

↓

Assigned

↓

In Progress

↓

Completed

↓

Verified

Maintenance history remains attached to the property permanently.

---

# Module 10 — Property Documentation

Digital document vault.

Examples

Property

* Ownership documents
* Survey
* Deed
* Building approval

Tenant

* Identification
* Lease
* Guarantor documents

Landlord

* Agreement
* Bank details
* Identification

Maintenance

* Invoice
* Quotations
* Receipts

All documents support version history and download permissions.

---

# Module 11 — Inspections

Move-in inspection

Routine inspection

Move-out inspection

Each inspection includes

* Checklist
* Photos
* Comments
* Inspector
* Date
* Signature

---

# Module 12 — Complaints & Queries

Tenants submit complaints.

Examples

* Noise
* Water
* Electricity
* Security
* Plumbing

Workflow

Submitted

↓

Assigned

↓

In Progress

↓

Resolved

↓

Closed

Conversation history remains attached.

---

# Module 13 — Employee Management

Employee profile

* Name
* Department
* Role
* Phone
* Email
* Assigned properties

Permissions controlled by roles.

---

# Module 14 — Role & Permission System

Granular permissions.

Examples

Properties

* View
* Create
* Edit
* Delete

Tenants

* View
* Edit

Transactions

* View
* Create

Reports

* Export

Documents

* Upload
* Delete

Maintenance

* Assign

Employees

* Manage

---

# Module 15 — Notifications

System notifications

Examples

* Rent due
* Lease expiring
* Maintenance assigned
* Payment received
* Document uploaded
* Inspection scheduled

Channels

* In-app

Future

* Email
* SMS
* WhatsApp

---

# Module 16 — Analytics & Reports

Agency Reports

Revenue

Occupancy

Vacancy

Late payments

Maintenance costs

Property profitability

Landlord Reports

Monthly income

Expenses

Net income

Property performance

Tenant Reports

Payment history

Outstanding balance

Lease status

Maintenance history

Export

* PDF
* Excel

---

# Module 17 — Audit Logs

Every action is recorded.

Examples

User

Action

Date

IP

Old value

New value

Cannot be modified.

---

# Module 18 — Search

Global search across

* Property
* Unit
* Tenant
* Landlord
* Transaction
* Document
* Complaint

Supports filters.

---

# Module 19 — Activity Timeline

Each property contains a complete timeline.

Example

Property Created

↓

Tenant Added

↓

Lease Uploaded

↓

Rent Paid

↓

Maintenance Requested

↓

Inspection Completed

↓

Lease Renewed

---

# 5. Landlord Portal

Landlords log into a dedicated portal to view information related only to their properties.

Features:

* Dashboard
* Property overview
* Occupancy status
* Rent collected
* Outstanding rent
* Expense tracking
* Maintenance updates
* Documents
* Financial statements
* Analytics
* Property timeline

Read-only by default.

---

# 6. Functional Requirements

The system shall:

* Support multiple landlords.
* Support multiple properties per landlord.
* Support multiple units per property.
* Allow multiple tenants across different properties.
* Store digital documents.
* Maintain transaction history.
* Record maintenance requests.
* Support role-based access.
* Provide landlord visibility without exposing agency-wide data.
* Generate reports and analytics.
* Keep audit logs for every critical action.

---

# 7. Non-Functional Requirements

* Responsive web application.
* Fast page loading.
* Secure authentication.
* Role-based authorization.
* Automatic backups.
* File encryption for sensitive documents.
* Audit trail.
* High availability.
* Scalable architecture.
* Mobile-friendly interface.

---

# 8. Future Enhancements (Post-MVP)

* Online rent payments.
* Accounting software integration.
* Electronic signatures for leases.
* AI-powered rent forecasting.
* AI maintenance cost prediction.
* OCR for document processing.
* Tenant mobile application.
* Landlord mobile application.
* Contractor portal.
* Utility bill management.
* Visitor management.
* Smart lock integration.
* Calendar integration.
* Automated reminders via WhatsApp, SMS, and email.
* Business intelligence dashboards with predictive analytics.

---

# 9. Success Metrics

* Reduction in manual paperwork.
* Percentage of property documents digitized.
* Time required to retrieve records.
* Rent collection rate.
* Maintenance resolution time.
* Landlord satisfaction.
* Tenant satisfaction.
* Employee productivity.
* Reduction in accounting errors.
* Complete auditability of financial and operational activities.

---

This architecture aligns well with an internal deployment, supports multiple landlords and employees efficiently, and provides a solid foundation for adding future capabilities such as a tenant portal, mobile app property management.

---

# 10. Agency Workspace UI Direction

The dashboard is an internal agency operations tool used to manage landlord portfolios, properties, units, tenants, documents, finances, maintenance, and decisions.

## Interface Principles

* Use a clean, neutral, Notion-inspired interface.
* Use a sans-serif type system with a compact Notion-like scale.
* Do not use serif typography.
* Do not use green as a brand or primary interface color.
* The sidebar must be collapsible while retaining icon navigation.
* The agency overview is global and combines attention items, schedules, tasks, pending work, and decisions across all landlords.

## Frontend Styling Conventions

* Tailwind utility classes may be written directly in pages and components for layout, spacing, borders, positioning, responsive behavior, and other component styling.
* Do not assign text sizes ad hoc in pages or components. Define the typography scale globally in `app/globals.css` so headings, paragraphs, labels, metadata, and other text roles can be changed consistently from one place.
* Define all interface colors as named CSS variables in `app/globals.css`.
* Expose the named color variables through Tailwind's theme configuration so pages and components use concise semantic utilities such as `text-primary`, `text-secondary`, `bg-surface`, `bg-sidebar`, and `border-default`.
* Do not use verbose arbitrary-value color classes such as `text-[var(--color-text-primary)]` when a semantic Tailwind token exists.
* Do not place raw hexadecimal, RGB, HSL, or other literal color values in page or component class names or inline styles.
* Inline Tailwind itself is not prohibited. The centralized restrictions apply specifically to typography sizing and color definitions.

## Landlord Workspace Model

* Agency owners can search landlords from the global workspace bar.
* A landlord can own multiple real estates and properties.
* Agency users can open multiple landlord workspaces as tabs.
* The active landlord tab scopes the Overview, Properties, Units, Tenants, leases, finances, maintenance, and documents views.
* The agency overview remains available as a separate global workspace.
* Landlords have a separate read-only dashboard showing only their own portfolio, income, expenses, tenants, maintenance, documents, reports, and activity timeline.

## Agency Capabilities

* Manage landlord real estate portfolios.
* Add and maintain apartments and units.
* Manage tenants and tenancy records.
* Send email communications to tenants.
* Store, version, and send legal documents.
* Manage agency team members and granular permissions.
* Review operational and financial information to support decisions.
