# Comprehensive User Flow Documentation
## Service Request Platform

**Version:** 1.0  
**Last Updated:** October 16, 2025  
**Status Model:** Assignment-Based (No Proposals)

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Status Lifecycle](#status-lifecycle)
3. [Customer User Flow](#customer-user-flow)
4. [Provider User Flow](#provider-user-flow)
5. [Status Transitions Matrix](#status-transitions-matrix)
6. [Notification System](#notification-system)
7. [Edge Cases & Special Scenarios](#edge-cases--special-scenarios)

---

## 🎯 System Overview

### Core Concept
This platform connects **customers** who need services with **service providers** using an **automatic matching system**. There are NO manual proposals—the system automatically finds and notifies qualified providers.

### User Types
- **Customer**: Creates service requests and selects from interested providers
- **Provider**: Receives job notifications, accepts assignments, performs work
- **Admin**: Oversees platform operations and user management

### Key Architecture Components
- **Automatic Matching Engine**: Matches requests to qualified providers based on:
  - Category expertise
  - Location proximity (within 50 miles)
  - Provider availability
  - Match score algorithm
- **Request Eligible Providers Table**: Tracks which providers were matched to which requests
- **Real-time WebSocket**: Live updates for status changes, new acceptances, etc.

---

## 🔄 Status Lifecycle

### Service Request Statuses

| Status | Description | Can Change To | Who Can Trigger |
|--------|-------------|---------------|----------------|
| **`pending`** | Request created, waiting for provider acceptance | `assigned`, `cancelled` | System (auto-created) |
| **`assigned`** | Customer selected a provider, work not started | `in_progress`, `pending` (if provider cancels), `cancelled` | Customer confirms provider |
| **`in_progress`** | Provider has started the work | `completed`, `cancelled` | Provider starts work |
| **`completed`** | Work is finished | N/A (terminal state) | Provider marks complete |
| **`cancelled`** | Request was cancelled | N/A (terminal state) | Customer or Provider |

### Provider Eligibility Statuses (in `request_eligible_providers` table)

| Status | Description | Next Status |
|--------|-------------|-------------|
| **`eligible`** | Provider was matched by algorithm | `notified`, `accepted`, `rejected` |
| **`notified`** | Provider received notification | `accepted`, `rejected` |
| **`accepted`** | Provider accepted, waiting for customer | `selected`, `rejected` |
| **`selected`** | Customer chose this provider | `cancelled_*` |
| **`rejected`** | Provider declined OR customer chose someone else | N/A |
| **`cancelled_by_provider`** | Provider cancelled after being selected | N/A |
| **`cancelled_unassigned`** | Customer cancelled before assigning | N/A |
| **`cancelled_assigned`** | Customer cancelled after assigning | N/A |
| **`cancelled_in_progress`** | Cancelled while work was ongoing | N/A |

---

## 👤 Customer User Flow

### 1️⃣ **Discovery & Request Creation**

**Page:** `/request-service` (Services page)

**Flow:**
1. Customer browses available service categories
2. Selects a category (e.g., "Plumbing", "Electrical")
3. Fills out service request form:
   - Title
   - Description
   - Address/Location
   - Preferred date (optional)
   - Urgency level (low/medium/high)
   - Estimated hours
   - Upload photos (optional)
4. Submits request

**What Happens Server-Side:**
- Request created with status: `pending`
- Matching algorithm runs automatically
- System finds qualified providers within 50 miles
- Top providers (by match score) are notified immediately
- Customer is NOT notified yet—waiting for provider responses

**Customer Dashboard Changes:**
- New request appears in "My Requests"
- Shows "Pending" status
- Shows "0 providers interested" initially

---

### 2️⃣ **Waiting for Provider Acceptance**

**Page:** `/my-requests` (My Requests page)

**Status:** `pending`

**Customer Sees:**
- Request card with "Pending" badge (blue)
- "0 providers interested" (initially)
- "View Interested Providers" button (disabled if 0)
- "Cancel Request" button

**What's Happening Behind the Scenes:**
- Providers are receiving notifications
- Providers are viewing job details
- Some providers might be accepting

**Real-Time Updates (WebSocket):**
- When a provider accepts → Counter updates: "1 provider interested"
- Customer receives notification: "A provider accepted your request"
- "View Interested Providers" button becomes active

---

### 3️⃣ **Reviewing & Selecting Provider**

**Trigger:** Customer clicks "View Interested Providers"

**Page/Modal:** `AcceptedProvidersModal`

**Customer Sees:**
- List of providers who accepted
- For each provider:
  - Name
  - Profile photo
  - Star rating (if available)
  - Total jobs completed
  - "Confirm Provider" button

**Customer Actions:**
1. Reviews provider profiles
2. Clicks "Confirm Provider" on preferred provider
3. Confirms selection in modal

**What Happens Server-Side:**
- Request status changes: `pending` → `assigned`
- Selected provider's eligibility status: `accepted` → `selected`
- Other providers' eligibility status: `accepted` → `rejected`
- `assigned_provider_id` is set
- `assigned_at` timestamp recorded

**Notifications Sent:**
- ✅ **Selected provider**: "Assignment confirmed - Customer confirmed you for [Job Title]"
- ❌ **Rejected providers**: "Customer selected another provider for [Job Title]"
- ℹ️ **Customer**: "Provider confirmed for [Job Title]"

---

### 4️⃣ **Provider Assigned - Waiting for Work to Start**

**Status:** `assigned`

**Customer Dashboard Shows:**
- Request card with "Assigned" badge (purple)
- Provider name displayed
- "View Details" button → Shows provider contact info
- "Cancel Request" button still available

**Customer Can:**
- View provider details (name, rating, contact info)
- Wait for provider to start work
- Cancel if needed (job will reopen)

**Provider Can:**
- View job details including customer contact info
- Start work when ready
- Cancel (job will reopen for other providers)

---

### 5️⃣ **Work In Progress**

**Trigger:** Provider clicks "Start Work"

**Status Change:** `assigned` → `in_progress`

**Customer Dashboard Shows:**
- Request card with "Active" badge (amber/yellow)
- "Work started on [date]"
- "View Details" button
- "Cancel Request" still available (with warning)

**Customer Receives Notification:**
- "Work Started - Work has started on [Job Title]"

**Customer Can:**
- Track progress
- Contact provider
- Cancel (with consequences—job will be marked cancelled, not reopened)

---

### 6️⃣ **Work Completed**

**Trigger:** Provider clicks "Mark as Complete"

**Status Change:** `in_progress` → `completed`

**Customer Dashboard Shows:**
- Request card with "Completed" badge (green)
- "Completed on [date]"
- "Leave Review" button (prominent)
- "View Details" button

**Customer Receives Notification:**
- "Job Completed - [Job Title] has been marked as completed. Please leave a review!"

**Customer Next Steps:**
1. Verify work is satisfactory
2. Leave review for provider (star rating + comment)
3. Job moves to "Completed" history

**Terminal State:** Request cannot be modified further.

---

### 7️⃣ **Cancellation (Customer-Initiated)**

**Available During:** `pending`, `assigned`, `in_progress`

**Flow:**
1. Customer clicks "Cancel Request"
2. Confirmation modal appears
3. Optional: Enter cancellation reason
4. Confirm cancellation

**What Happens:**

**If Status = `pending`:**
- All providers who accepted are notified: "Customer cancelled [Job Title]"
- Their eligibility status → `cancelled_unassigned`
- Request status → `cancelled`

**If Status = `assigned`:**
- Assigned provider notified: "Customer cancelled [Job Title]"
- Provider eligibility status → `cancelled_assigned`
- Request status → `cancelled`
- Job does NOT reopen

**If Status = `in_progress`:**
- Provider notified: "Customer cancelled [Job Title]"
- Provider eligibility status → `cancelled_in_progress`
- Request status → `cancelled`
- May require dispute resolution

---

## 🛠️ Provider User Flow

### 1️⃣ **Receiving Job Notifications**

**Trigger:** Automatic matching system identifies provider as qualified

**What Happens:**
- Provider's eligibility record created with status: `eligible`
- System sends notification: "New Service Request Available"
- Provider receives WebSocket real-time update
- Provider sees notification bell (red dot)

**Provider Dashboard Updates:**
- "Available Jobs" counter increases
- New job appears in available jobs list

---

### 2️⃣ **Browsing Available Jobs**

**Page:** `/provider/available-jobs` (Available Jobs page)

**Provider Sees:**
- List of jobs they were matched to
- For each job:
  - Title
  - Category
  - Location (address)
  - Distance (miles away)
  - Urgency badge
  - Estimated hours
  - Match score (why they were selected)
  - Preferred date
- Sort options: Newest first, Distance, Match score
- Filter options: All categories, Urgency levels

**Provider Can:**
- Click "View Details" to see full job description
- Click "Accept Job" to express interest
- Click "Decline" to remove from list

---

### 3️⃣ **Viewing Job Details**

**Page/Modal:** `JobDetailsModal`

**Provider Sees (Progressive Disclosure):**

**Before Accepting:**
- Job title & description
- Location/address (approximate)
- Service category & tier
- Estimated hours
- Urgency level
- Preferred date
- Customer first name only (e.g., "John D.")
- Customer rating & total jobs
- Photos (if uploaded)
- ❌ **NO contact info yet**

**After Customer Assigns:**
- Everything above PLUS:
- ✅ Full customer name
- ✅ Customer email
- ✅ Customer phone number

---

### 4️⃣ **Accepting a Job**

**Trigger:** Provider clicks "Accept Job"

**What Happens Server-Side:**
- Provider's eligibility status: `eligible` → `accepted`
- Record created in `request_acceptances` table
- Customer receives notification
- Provider counter updates for customer

**Provider's View Updates:**
- Job moves from "Available Jobs" to "Pending Selection" section
- Shows "Waiting for customer to confirm"
- Can no longer decline (already expressed interest)

**Waiting State:**
- Provider waits for customer decision
- If customer selects another provider → Notified "Customer selected another provider"
- If customer selects this provider → Notified "Assignment confirmed"

---

### 5️⃣ **Assignment Confirmed by Customer**

**Trigger:** Customer selects this provider

**Status Change:** Provider eligibility: `accepted` → `selected`  
**Request Status Change:** `pending` → `assigned`

**Provider Receives Notification:**
- "Assignment confirmed - Customer confirmed you for [Job Title]"

**Provider Dashboard Updates:**
- Job moves from "Pending Selection" to "Accepted Jobs"
- Shows "Assigned" status
- "Start Work" button appears

**Provider Can Now:**
- View full customer contact details
- Contact customer to schedule
- Start work when ready
- Cancel (with consequences—job reopens)

**Page:** `/provider/accepted-jobs` (Accepted Jobs page)

---

### 6️⃣ **Starting Work**

**Trigger:** Provider clicks "Start Work"

**Status Change:** `assigned` → `in_progress`

**What Happens:**
- `started_at` timestamp recorded
- Customer notified: "Work Started"
- Provider stats updated

**Provider Dashboard Shows:**
- Job has "Active" badge
- "Started on [date]" timestamp
- "Mark as Complete" button
- "Cancel Job" button (with warning)

**Provider Can:**
- Perform the work
- Mark as complete when done
- Cancel if unable to continue (serious consequences)

---

### 7️⃣ **Completing Work**

**Trigger:** Provider clicks "Mark as Complete"

**Confirmation Modal:**
- "Are you sure the work is completed?"
- "Customer will be notified and asked to review"
- Confirm/Cancel buttons

**Status Change:** `in_progress` → `completed`

**What Happens:**
- `completed_at` timestamp recorded
- Provider's `total_jobs_completed` incremented
- Customer notified: "Job Completed"
- Customer can now leave review

**Provider Dashboard Updates:**
- Job moves to "Completed" history
- Shows completion date
- Awaits customer review

**Terminal State:** Provider cannot modify this job further.

---

### 8️⃣ **Declining Available Jobs**

**Available During:** Before customer assigns (while status = `pending`)

**Flow:**
1. Provider clicks "Decline" on available job
2. Optional: Enter reason
3. Confirm decline

**What Happens:**
- Provider's eligibility status: → `rejected`
- Provider's `total_jobs_declined` incremented
- Job removed from provider's available list
- Customer's counter decreases by 1 (if provider had accepted)
- No notification sent to customer

---

### 9️⃣ **Cancellation (Provider-Initiated)**

**Scenario A: Provider Cancels After Assignment BUT Before Starting Work**

**Status:** `assigned` → `pending` (JOB REOPENS!)

**What Happens:**
1. Provider clicks "Cancel Assignment"
2. Enters cancellation reason (required)
3. Confirms cancellation

**Server-Side:**
- Request status: `assigned` → `pending` (REOPENS!)
- Provider's eligibility: `selected` → `cancelled_by_provider`
- Other providers' eligibility: `rejected` → `eligible` (REOPENED!)
- `assigned_provider_id` cleared

**Notifications:**
- ✅ **Customer**: "Provider Cancelled - Job reopened for other providers"
- ✅ **Previously rejected providers**: "Job Available Again - [Job Title] is available"

**Result:** Job goes back to marketplace for other providers to accept.

---

**Scenario B: Provider Cancels After Starting Work**

**Status:** `in_progress` → `cancelled` (DOES NOT REOPEN)

**What Happens:**
1. Provider clicks "Cancel Job" (warning shown)
2. Enters detailed cancellation reason (required)
3. Confirms cancellation

**Server-Side:**
- Request status: `in_progress` → `cancelled`
- Provider's eligibility: `selected` → `cancelled_in_progress`
- Provider's reputation may be affected
- Job does NOT reopen (customer must create new request)

**Notifications:**
- ⚠️ **Customer**: "Job Cancelled - Provider cancelled [Job Title]: [reason]"

**Result:** Job permanently cancelled. May require dispute resolution.

---

## 📊 Status Transitions Matrix

### Complete State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE REQUEST LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

[CREATED]
    │
    ├─→ [PENDING] ────────────────────────┐
    │      │                               │
    │      │ Customer confirms provider    │
    │      ├─→ [ASSIGNED] ─────────────┐   │
    │      │      │                     │   │
    │      │      │ Provider starts     │   │
    │      │      ├─→ [IN_PROGRESS] ─┐ │   │
    │      │      │      │            │ │   │
    │      │      │      │ Provider   │ │   │
    │      │      │      │ completes  │ │   │
    │      │      │      └─→ [COMPLETED] (terminal)
    │      │      │                    │ │   │
    │      │      │ Provider cancels   │ │   │
    │      │      │ before start       │ │   │
    │      │      └─────→ [PENDING]    │ │   │
    │      │         (REOPENS!)        │ │   │
    │      │                            │ │   │
    │      │ Customer/Provider cancels  │ │   │
    │      └────────────────────────────┴─┴───┴→ [CANCELLED] (terminal)
    │
    └────────────────────────────────────────────┘
```

### Transition Rules

| From State | To State | Trigger | Who Can Do It | Conditions |
|-----------|----------|---------|---------------|------------|
| `pending` | `assigned` | Customer confirms provider | Customer | ≥1 provider must have accepted |
| `assigned` | `in_progress` | Provider starts work | Assigned Provider | Provider is ready to start |
| `in_progress` | `completed` | Provider marks complete | Assigned Provider | Work is finished |
| `assigned` | `pending` | Provider cancels (reopen) | Assigned Provider | Before work starts |
| `pending` | `cancelled` | Cancellation | Customer | Anytime before assignment |
| `assigned` | `cancelled` | Cancellation | Customer or Provider | Before work starts |
| `in_progress` | `cancelled` | Cancellation | Customer or Provider | During work (serious) |

---

## 🔔 Notification System

### Notification Types & Recipients

| Event | Notification Type | Recipient | Title | Message Template |
|-------|------------------|-----------|-------|------------------|
| Request created | `request_created` | Customer | Request Submitted | Your request "[Title]" has been submitted |
| Provider notified | `new_assignment` | Provider | New Service Request | New job available: "[Title]" |
| Provider accepts | `provider_accepted` | Customer | Provider Interested | [Provider] is interested in "[Title]" |
| Customer confirms | `assignment_confirmed` | Selected Provider | Assignment Confirmed | Customer confirmed you for "[Title]" |
| Customer confirms | `assignment_not_selected` | Rejected Providers | Not Selected | Customer chose another provider |
| Customer confirms | `assignment_confirmed_customer` | Customer | Provider Confirmed | You confirmed [Provider] for "[Title]" |
| Work starts | `job_started` | Customer | Work Started | Work has started on "[Title]" |
| Work completes | `job_completed` | Customer | Job Completed | "[Title]" completed - Please review! |
| Job reopens | `job_reopened` | Eligible Providers | Job Available Again | "[Title]" is available - previous provider cancelled |
| Provider cancels | `provider_cancelled` | Customer | Provider Cancelled | Provider cancelled "[Title]" - Job reopened |
| Customer cancels | `job_cancelled` | Affected Providers | Job Cancelled | Customer cancelled "[Title]" |

### Notification Channels
1. **In-App**: Notification bell with counter
2. **WebSocket**: Real-time updates (no page refresh needed)
3. **Email**: (Future) For critical events
4. **SMS**: (Future) For urgent updates

---

## ⚠️ Edge Cases & Special Scenarios

### 1. **Multiple Providers Accept**

**Scenario:** 5 providers accept the same pending request.

**Behavior:**
- All 5 providers see "Pending Selection" state
- Customer sees "5 providers interested"
- Customer can review all 5 profiles
- Customer selects 1 provider
- That provider gets assignment
- Other 4 get "Not selected" notification
- Their eligibility status → `rejected`

---

### 2. **Provider Cancels After Assignment But Before Start**

**Scenario:** Provider accepts → Customer confirms → Provider cancels before starting work.

**Behavior:**
- Request status: `assigned` → `pending` (REOPENS)
- Previously rejected providers → `eligible` again
- Job appears in their "Available Jobs" again
- They receive "Job Available Again" notification
- Customer notified: "Provider cancelled - job reopened"

**Why?** Give customer a second chance without creating new request.

---

### 3. **Provider Cancels During Work**

**Scenario:** Provider starts work → Provider cancels mid-job.

**Behavior:**
- Request status: `in_progress` → `cancelled` (DOES NOT REOPEN)
- Provider's eligibility: → `cancelled_in_progress`
- Customer notified with reason
- Job stays cancelled (doesn't reopen automatically)

**Why?** Partial work was done—customer needs to assess situation before creating new request.

---

### 4. **Customer Cancels While Provider Working**

**Scenario:** Work in progress → Customer cancels.

**Behavior:**
- Request status: `in_progress` → `cancelled`
- Provider's eligibility: → `cancelled_in_progress`
- Provider notified immediately
- May trigger dispute resolution workflow
- Payment handling required

---

### 5. **No Providers Accept**

**Scenario:** Request created → 10 providers notified → None accept after 24 hours.

**Current Behavior:**
- Request stays `pending`
- Customer sees "0 providers interested"

**Future Enhancement:**
- Auto-rematch after 24 hours
- Expand search radius to 75 miles
- Notify customer to adjust request details

---

### 6. **Provider Declines After Previously Accepting**

**Scenario:** Provider clicks "Accept" → Changes mind → Wants to decline.

**Current Behavior:**
- Once accepted, provider is committed
- Must wait for customer decision
- If not selected, automatically marked `rejected`

**Workaround:**
- Provider can ignore the assignment
- Customer will select someone else
- Provider marked `rejected` automatically

---

### 7. **Expired Requests**

**Scenario:** Request has `preferred_date` in the past.

**Current Behavior:**
- Request stays active (no auto-expiry)
- Provider can still accept

**Future Enhancement:**
- Auto-expire requests 7 days after preferred date
- Notify customer to refresh request

---

## 📱 Page Structure Summary

### Customer Pages

| Page | Route | Purpose | Status Filter |
|------|-------|---------|---------------|
| Dashboard | `/customer/dashboard` | Overview stats & recent activity | All |
| Services | `/request-service` | Browse categories & create request | N/A |
| My Requests | `/my-requests` | View all requests | Pending, Assigned, Active, Done |
| Request Detail | `/my-requests/:id` | View single request details | N/A |
| Notifications | `/notifications` | View all notifications | All types |
| Profile | `/profile` | Edit profile & settings | N/A |

### Provider Pages

| Page | Route | Purpose | Status Filter |
|------|-------|---------|---------------|
| Dashboard | `/provider/dashboard` | Overview stats & recent jobs | All |
| Available Jobs | `/provider/available-jobs` | Jobs available to accept | Pending |
| Accepted Jobs | `/provider/accepted-jobs` | Jobs assigned to provider | Assigned, Active |
| Notifications | `/notifications` | View all notifications | All types |
| Profile | `/profile` | Edit profile, skills & availability | N/A |

### Shared Pages

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Authenticate user |
| Register | `/register` | Create new account |
| Notifications | `/notifications` | Unified notification center |
| Profile | `/profile` | User profile management |

---

## 🔧 Technical Implementation Notes

### Real-Time Updates (WebSocket Events)

```typescript
// Customer listens for:
- REQUEST_STATUS_CHANGED   // Status transitions
- PROVIDER_ACCEPTED        // New provider interested
- PROVIDER_CONFIRMED       // Assignment confirmed
- WORK_STARTED            // Provider started work
- WORK_COMPLETED          // Provider completed work

// Provider listens for:
- NEW_ASSIGNMENT          // New job available
- ASSIGNMENT_CONFIRMED    // Customer selected you
- ASSIGNMENT_REJECTED     // Customer chose someone else
- JOB_CANCELLED          // Customer cancelled
- JOB_REOPENED           // Job available again
```

### Database Tables Involved

1. **`service_requests`**
   - Main request data
   - Status tracking
   - Assignment info

2. **`request_eligible_providers`**
   - Tracks which providers matched
   - Provider-specific status
   - Match scores & distance

3. **`request_acceptances`**
   - Legacy table for acceptances
   - Being phased out in favor of `request_eligible_providers`

4. **`users`**
   - Customer & provider profiles
   - Ratings & stats
   - Contact info (with progressive disclosure)

5. **`notifications`**
   - All user notifications
   - Read/unread status
   - Action URLs

---

## ✅ Key Takeaways

### For Customers:
1. Create request → Wait for provider interest → Select provider → Work happens → Leave review
2. You control provider selection
3. You can cancel anytime (with consequences if work started)
4. Track everything in "My Requests"

### For Providers:
1. Receive notifications → View job details → Accept if interested → Wait for customer → Perform work → Get paid
2. You don't bid/propose—just accept or decline
3. Cancelling after customer assigns reopens job (before start)
4. Cancelling during work is serious (doesn't reopen)
5. Track everything in "Accepted Jobs"

### Status Progression (Happy Path):
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
   ↓          ↓           ↓
Customer   Provider    Provider
creates    confirms    completes
          & assigns
```

---

**End of Documentation**  
For technical implementation details, see `server/src/services/requestService.ts`  
For UI/UX specifications, see `DESIGN_SYSTEM.md`

