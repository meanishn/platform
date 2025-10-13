# Provider Client-Side UI/UX Specification

**Date:** October 12, 2025  
**Purpose:** Complete provider experience redesign with new eligible provider architecture

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Navigation Structure](#navigation-structure)
3. [Page-by-Page Breakdown](#page-by-page-breakdown)
4. [API Mapping](#api-mapping)
5. [User Flows](#user-flows)
6. [Component Specifications](#component-specifications)
7. [Notification Handling](#notification-handling)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Design Philosophy
- **Tab-Based Navigation**: Clear separation between job states
- **Progressive Disclosure**: Show partial details initially, full details when needed
- **Action-Oriented**: Primary actions prominently displayed
- **Real-Time Updates**: Notifications drive navigation to correct pages
- **Match Quality First**: Show match scores, distance, rank prominently

---

## Navigation Structure

### Main Provider Layout

```
┌─────────────────────────────────────────────────────────┐
│  Logo    Dashboard  Jobs  Assignments  History  Profile │
└─────────────────────────────────────────────────────────┘
```

### Jobs Section (New!)

```
┌─────────────────────────────────────────────────────────┐
│  Available (5)  │  Accepted (2)  │  Declined (12)       │
└─────────────────────────────────────────────────────────┘
```

### Active Work (Redesigned!)

**No tabs needed** - Single priority view:
- In-progress jobs shown first (large, prominent)
- Upcoming assigned jobs shown below
- Most providers have 0-2 active jobs total
- Visual hierarchy emphasizes ongoing work

---

## Page-by-Page Breakdown

### 1. 📊 Dashboard (`/provider/dashboard`)

**Purpose:** Quick overview of all provider activities

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Welcome Back, John! 👋                                    │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🎯 NEW   │  │ ✅ ACCEPT│  │ 🔨 ACTIVE│  │ 💰 EARN  │  │
│  │   5      │  │   2      │  │   1      │  │ $2,450   │  │
│  │ Available│  │ Accepted │  │ Ongoing  │  │ This Mo  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  ┌─── Quick Actions ────────────────────────────────────┐ │
│  │  → View 5 new jobs matching your skills              │ │
│  │  → 2 jobs waiting for customer decision              │ │
│  │  → 1 job ready to start                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─── Active Work ───────────────────────────────────────┐│
│  │ 🔨 In Progress (1)              📋 Next Up (1)      ││
│  │                                                       ││
│  │ Fix Kitchen Sink                Electrical Outlet    ││
│  │ Started 2h ago • 2h left        Starts 2pm (3h)      ││
│  │ [View] [Complete]               [View] [Start]       ││
│  │                                                       ││
│  │ [View All Active Work]                               ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  ┌─── Accepted Jobs (Pending Selection) ────────────────┐│
│  │ ✅ #125 - Plumbing Repair (Rank #1 - 95% match)      ││
│  │    You accepted 3h ago  •  Waiting for customer      ││
│  │    [View Details]  [Decline]                         ││
│  └──────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### API Calls

```typescript
// On page load
const stats = await providerApi.getProviderStats();
const activity = await providerApi.getProviderActivity();
const availableJobs = await providerApi.getAvailableJobs(); // Count
const acceptedJobs = await providerApi.getAcceptedPendingJobs(); // NEW!
const activeAssignments = await providerApi.getAssignments({ status: 'assigned,in_progress' });
```

#### Key Metrics

1. **Available Jobs** - Count of eligible/notified jobs
2. **Accepted Jobs** - Jobs waiting for customer selection
3. **Active Jobs** - Assigned + In Progress
4. **Earnings** - Total from completed jobs

---

### 2. 🎯 Available Jobs (`/provider/jobs/available`)

**Purpose:** Browse and accept new job opportunities

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Available Jobs (5)                          [🔄 Refresh]  │
│                                                            │
│  Filters: [All] [Nearby] [High Match] [Urgent]            │
│  Sort by: [Match Score ▼] [Distance] [Posted Date]        │
│                                                            │
│  ┌─── Job Card ──────────────────────────────────────────┐│
│  │ 🏆 #1 BEST MATCH • 95% • 2.5 miles • Rank #1          ││
│  │                                                        ││
│  │ Fix Kitchen Sink                                      ││
│  │ Leaking faucet needs immediate repair                 ││
│  │                                                        ││
│  │ 📍 123 Main St                                        ││
│  │ ⏱️ Est. 2-3 hours                                     ││
│  │ 📅 Preferred: Today                                   ││
│  │ 🚨 URGENT                                             ││
│  │                                                        ││
│  │ Customer: John D. ⭐ 4.8 (12 reviews)                 ││
│  │                                                        ││
│  │ [Accept Job] [View Details] [Decline]                ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ┌─── Job Card ──────────────────────────────────────────┐│
│  │ 88% • 5.2 miles • Rank #2                             ││
│  │                                                        ││
│  │ Electrical Outlet Installation                        ││
│  │ Need 3 outlets installed in home office               ││
│  │                                                        ││
│  │ 📍 456 Oak Ave                                        ││
│  │ ⏱️ Est. 1-2 hours                                     ││
│  │ 📅 Preferred: Tomorrow                                ││
│  │                                                        ││
│  │ Customer: Sarah M. ⭐ 5.0 (8 reviews)                 ││
│  │                                                        ││
│  │ [Accept Job] [View Details] [Decline]                ││
│  └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### API Calls

```typescript
// On page load
const jobs = await providerApi.getAvailableJobs();
// Returns: ServiceRequestListItemDto[] with matchScore, distanceMiles, rank

// Quick accept from card
const result = await providerApi.performAction(jobId, 'accept');

// Quick decline from card
const result = await providerApi.performAction(jobId, 'decline', reason);
```

#### Response Structure

```typescript
{
  success: true,
  data: [
    {
      id: 123,
      title: "Fix Kitchen Sink",
      description: "Leaking faucet...",
      category: { id: 1, name: "Plumbing" },
      tier: { id: 1, name: "Basic", hourlyRate: 50 },
      address: "123 Main St",
      urgency: "high",
      status: "pending",
      estimatedHours: 2.5,
      preferredDate: "2025-10-12T14:00:00Z",
      // NEW: Matching metadata
      matchScore: 95,
      distanceMiles: 2.5,
      rank: 1,
      // Partial customer info
      customer: {
        id: 456,
        name: "John D.",
        averageRating: 4.8,
        totalReviews: 12
        // NO email, phone, full address yet
      }
    }
  ]
}
```

---

### 3. ✅ Accepted Jobs (`/provider/jobs/accepted`)

**Purpose:** View jobs accepted but waiting for customer selection

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Accepted Jobs - Pending Selection (2)                    │
│                                                            │
│  ℹ️ These are jobs you accepted. The customer is reviewing│
│     providers and will select one soon.                   │
│                                                            │
│  ┌─── Job Card ──────────────────────────────────────────┐│
│  │ ⏳ PENDING SELECTION                                   ││
│  │                                                        ││
│  │ Fix Kitchen Sink                    You're Rank #1 🏆 ││
│  │                                                        ││
│  │ ✅ You accepted 3h ago                                ││
│  │ 📊 Match: 95% • 2.5 miles                            ││
│  │ 👥 2 other providers also accepted                    ││
│  │                                                        ││
│  │ 📍 123 Main St                                        ││
│  │ ⏱️ Est. 2-3 hours                                     ││
│  │ 📅 Preferred: Today                                   ││
│  │                                                        ││
│  │ Customer: John D. ⭐ 4.8                              ││
│  │                                                        ││
│  │ [View Details] [Decline Offer]                        ││
│  │                                                        ││
│  │ 💡 Tip: Being #1 means you're the top match!         ││
│  └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### API Calls

```typescript
// NEW endpoint!
const acceptedJobs = await providerApi.getAcceptedPendingJobs();

// Decline after accepting
const result = await providerApi.performAction(jobId, 'decline', 
  "Schedule conflict - cannot make it today"
);
```

---

### 4. 🔨 Active Work (`/provider/assignments`)

**Purpose:** Manage current and upcoming work with instant visibility of both states

**Design Rationale:** Like Uber drivers seeing their next ride while completing current one, providers need instant awareness of:
1. **Current job** - What they're working on NOW
2. **Next job** - What's coming up (can't miss this!)
3. **Easy toggle** - Switch between views without losing context

#### Layout: Dual-View with Quick Toggle

**Main View - Split Screen (Default)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing] [Upcoming]    [View History]│
│                       ────────                              │
│                                                            │
│  🔨 IN PROGRESS (1)                    📋 UPCOMING (1)    │
│  ┌───────────────────────────┐  ┌─────────────────────────┐│
│  │ Fix Kitchen Sink    #123 │  │ Electrical Outlet  #124││
│  │                          │  │                         ││
│  │ ⏱️ Started: 2h ago      │  │ 📅 Start: 2:00 PM      ││
│  │ ⏳ 2h left (of 4h est.) │  │ ⏰ In 3 hours          ││
│  │                          │  │                         ││
│  │ 📍 123 Main St, Apt 2A  │  │ 📍 456 Oak Ave, Unit 3B││
│  │ 👤 John D. ⭐ 4.8       │  │ 👤 Sarah M. ⭐ 5.0     ││
│  │ 📞 (555) 987-6543       │  │ 📞 (555) 123-4567      ││
│  │                          │  │                         ││
│  │ [Complete] [Details]    │  │ [View] [Cancel]        ││
│  └───────────────────────────┘  └─────────────────────────┘│
│                                                            │
│  💡 Your next job starts in 3 hours - plenty of time!     │
└────────────────────────────────────────────────────────────┘
```

**Mobile/Narrow View - Card Stack with Badge**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing] [Upcoming]    [View History]│
│                       ────────                              │
│                                                            │
│  ┌─── 🔨 IN PROGRESS ────────────────────────────────────┐│
│  │                                          📋 Next: 1    ││
│  │ Fix Kitchen Sink                         #123         ││
│  │                                                        ││
│  │ ⏱️ Started: 2h ago  •  ⏳ 2h left (of 4h est.)       ││
│  │                                                        ││
│  │ 📍 123 Main St, Apt 2A                                ││
│  │ 👤 John Davis ⭐ 4.8  •  📞 (555) 987-6543           ││
│  │                                                        ││
│  │ [Complete Job] [View Details] [Emergency Cancel]     ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ⬇️ NEXT UP - Starts in 3 hours                          │
│  ┌─── 📋 Electrical Outlet Installation ─────────────────┐│
│  │ 📅 Today 2:00 PM  •  📍 456 Oak Ave                   ││
│  │ 👤 Sarah M. ⭐ 5.0  •  📞 (555) 123-4567             ││
│  │ [View Details] [Cancel]                               ││
│  └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### Quick Filter Tabs

**Clicking "Ongoing" (Focus Mode)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing] [Upcoming]    [View History]│
│                       ────────                              │
│                                                            │
│  🔨 IN PROGRESS                               ⚡ Next: 1   │
│                                                            │
│  ┌─── Fix Kitchen Sink ──────────────────────────── #123 ┐│
│  │                                                        ││
│  │ ⏱️ Started: 2h ago  •  Est. 4h total                 ││
│  │ ⏳ Time remaining: ~2 hours (est.)                    ││
│  │ 🎯 Expected completion: 4:30 PM                       ││
│  │                                                        ││
│  │ 📍 123 Main St, Apt 2A, Downtown                      ││
│  │ 🗺️ [Open in Maps]                                     ││
│  │                                                        ││
│  │ ┌─── Customer ───────────────────────────────────┐   ││
│  │ │ 👤 John Davis                                  │   ││
│  │ │ ⭐ 4.8 stars (23 reviews)                      │   ││
│  │ │ 📞 (555) 987-6543  [Call Now]                 │   ││
│  │ │ 📧 john.d@email.com  [Message]                │   ││
│  │ │                                                │   ││
│  │ │ Notes: "Please knock loudly, doorbell broken" │   ││
│  │ └───────────────────────────────────────────────┘   ││
│  │                                                        ││
│  │ [✅ Complete Job] [View Full Details] [Emergency Cancel]│
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  💡 Your next job starts at 2:00 PM (in 3 hours)          │
│  [Tap "Upcoming" to see details]                          │
└────────────────────────────────────────────────────────────┘
```

**Clicking "Upcoming" (Planning Mode)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing] [Upcoming]    [View History]│
│                                  ────────                   │
│                                                            │
│  📋 UPCOMING ASSIGNMENTS                      🔨 Active: 1 │
│                                                            │
│  ┌─── Electrical Outlet Installation ───────────── #124 ┐ │
│  │                                                        ││
│  │ 📅 Today at 2:00 PM  •  ⏰ In 3 hours                ││
│  │ ⏱️ Estimated: 1-2 hours                               ││
│  │ 💵 $65/hour (Standard Tier)                           ││
│  │                                                        ││
│  │ 📍 456 Oak Ave, Unit 3B, Riverside                    ││
│  │ 🚗 15 min drive from current job                      ││
│  │ 🗺️ [Open in Maps] [Get Directions]                   ││
│  │                                                        ││
│  │ ┌─── Customer ───────────────────────────────────┐   ││
│  │ │ 👤 Sarah Miller                                │   ││
│  │ │ ⭐ 5.0 stars (8 reviews)                       │   ││
│  │ │ 📞 (555) 123-4567  [Call]                      │   ││
│  │ │ 📧 sarah.m@email.com  [Message]                │   ││
│  │ │                                                │   ││
│  │ │ Notes: "Call before coming. Gate code: #1234" │   ││
│  │ └───────────────────────────────────────────────┘   ││
│  │                                                        ││
│  │ [Start Early] [View Full Details] [Cancel Assignment]││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ⚠️ Finish current job first before starting this one     │
│  🔄 [Back to Ongoing]                                     │
└────────────────────────────────────────────────────────────┘
```

#### Special States

**Multiple Upcoming Jobs (Edge Case)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing] [Upcoming (3)]  [View History]│
│                                  ───────────                │
│                                                            │
│  � UPCOMING ASSIGNMENTS (3)                  🔨 Active: 1 │
│                                                            │
│  🔥 URGENT - Starts Soon!                                 │
│  ┌─── Electrical Outlet #124 ──────────────────────────┐  │
│  │ 📅 Today 2:00 PM • ⏰ 3 hours • 📍 456 Oak Ave      │  │
│  │ [View] [Cancel]                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  📆 Later Today                                           │
│  ┌─── Plumbing Repair #126 ────────────────────────────┐  │
│  │ 📅 Today 5:00 PM • ⏰ 6 hours • 📍 789 Pine St      │  │
│  │ [View] [Cancel]                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  📆 Tomorrow                                              │
│  ┌─── HVAC Check #127 ──────────────────────────────────┐ │
│  │ 📅 Tomorrow 9:00 AM • ⏰ 20 hours • 📍 321 Elm Ave  │  │
│  │ [View] [Cancel]                                      │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**No Ongoing Work (Upcoming Only)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work          [Ongoing (0)] [Upcoming (1)]          │
│                                      ─────────              │
│                                                            │
│  ✅ No active work - All clear!                           │
│                                                            │
│  📋 NEXT ASSIGNMENT - Ready to Start                      │
│  ┌─── Electrical Outlet Installation ───────────── #124 ┐ │
│  │                                                        ││
│  │ 📅 Today at 2:00 PM  •  ⏰ In 3 hours                ││
│  │ 📍 456 Oak Ave, Unit 3B                               ││
│  │ 👤 Sarah Miller ⭐ 5.0  •  📞 (555) 123-4567         ││
│  │                                                        ││
│  │ [Start Now] [View Details] [Cancel]                   ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  💡 You can start this job anytime before 2:00 PM         │
└────────────────────────────────────────────────────────────┘
```

**No Work at All (Empty State)**

```
┌────────────────────────────────────────────────────────────┐
│  Active Work                               [View History]  │
│                                                            │
│  ✨ You're all caught up!                                 │
│                                                            │
│  🎯 No ongoing or upcoming jobs                           │
│                                                            │
│  Ready to take on new work?                               │
│  [Browse Available Jobs]                                   │
│                                                            │
│  Or check if you have any:                                │
│  [View Accepted Jobs (2)]                                 │
└────────────────────────────────────────────────────────────┘
```

#### Key UX Features (Uber-Inspired)

1. **Badge Notifications**
   - "📋 Next: 1" badge on ongoing view
   - "🔨 Active: 1" badge on upcoming view
   - Always know what's happening in the other tab

2. **Time Awareness**
   - "In 3 hours" countdown for upcoming jobs
   - "Started 2h ago" timer for ongoing work
   - Auto-highlight if times conflict

3. **Location Intelligence**
   - "15 min drive from current job" distance calculation
   - Route planning between jobs
   - Flag if locations are far apart

4. **Smart Warnings**
   - ⚠️ "Finish current job first" if trying to start upcoming
   - 🔥 "URGENT - Starts Soon!" if upcoming job is within 1 hour
   - ⏰ "Time conflict!" if jobs overlap

5. **One-Tap Actions**
   - Call/Message customer directly from card
   - Open maps for navigation
   - Quick complete/cancel buttons

6. **Time-Based Progress (UI Only)**
   - Simple calculation: `(time elapsed / estimated duration) * 100`
   - Example: Started 2h ago, 4h estimate = 50% progress
   - Shows "⏳ 2h left (of 4h est.)" instead of percentage
   - No backend tracking - purely client-side display
   - Provider completes job when actually done, not when timer hits 100%

#### API Calls

```typescript
// Single call gets both assigned and in-progress
const activeJobs = await providerApi.getAssignments({ 
  status: 'assigned,in_progress' 
});

// Separate by status client-side
const ongoing = activeJobs.filter(j => j.status === 'in_progress');
const upcoming = activeJobs.filter(j => j.status === 'assigned');

// Sort upcoming by start time (earliest first)
upcoming.sort((a, b) => 
  new Date(a.preferredDate) - new Date(b.preferredDate)
);

// Actions
const result = await providerApi.performAction(jobId, 'start');
const result = await providerApi.performAction(jobId, 'complete');
const result = await providerApi.performAction(jobId, 'cancel', reason);
```

---

### 5. 📄 Job Details Modal/Page

**Purpose:** Show full job details with progressive disclosure

#### For Available Jobs (Before Accepting)

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Close]                                               │
│                                                          │
│  Fix Kitchen Sink                            #123       │
│  🏆 95% MATCH • Rank #1 • 2.5 miles away                │
│                                                          │
│  ┌─── Match Quality ────────────────────────────────┐   │
│  │ ⭐ You're the TOP match for this job!            │   │
│  │ • Perfect skill match (Plumbing Expert)          │   │
│  │ • Closest provider (2.5 miles)                   │   │
│  │ • Available at preferred time                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Description:                                            │
│  The kitchen faucet is leaking constantly. Need          │
│  immediate repair. May need parts replacement.           │
│                                                          │
│  Details:                                                │
│  📍 General Area: Downtown                              │
│  ⏱️ Estimated: 2-3 hours                                │
│  📅 Preferred: Today, ASAP                              │
│  🚨 Urgency: HIGH                                       │
│  💵 Rate: $50/hour (Basic Tier)                         │
│  📸 Photos: [3 images]                                  │
│                                                          │
│  Customer Information:                                   │
│  👤 John D. ⭐ 4.8 (12 reviews)                         │
│  📊 Verified customer                                   │
│  🏆 Always pays on time                                 │
│                                                          │
│  ⚠️ Full contact details shown after assignment        │
│                                                          │
│  [Accept This Job] [Decline]                            │
└──────────────────────────────────────────────────────────┘
```

#### For Assigned Jobs (After Customer Selection)

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Close]                                               │
│                                                          │
│  Electrical Outlet Installation              #124       │
│  🎯 ASSIGNED TO YOU                                     │
│                                                          │
│  Description:                                            │
│  Need 3 outlets installed in home office for new        │
│  equipment. All materials will be provided.              │
│                                                          │
│  Details:                                                │
│  📍 456 Oak Ave, Unit 3B, Riverside                     │
│  ⏱️ Estimated: 1-2 hours                                │
│  📅 Start by: Today 2:00 PM                             │
│  💵 Rate: $65/hour (Standard Tier)                      │
│  📸 Photos: [View 2 images]                             │
│                                                          │
│  ┌─── Customer Details ──────────────────────────────┐  │
│  │ 👤 Sarah Miller                                   │  │
│  │ ⭐ 5.0 stars (8 reviews)                          │  │
│  │ 📞 (555) 123-4567                                 │  │
│  │ 📧 sarah.m@email.com                              │  │
│  │ 📍 456 Oak Ave, Unit 3B                           │  │
│  │    Riverside, CA 92501                            │  │
│  │ 🗺️ [Open in Maps]                                 │  │
│  │                                                    │  │
│  │ Notes from customer:                              │  │
│  │ "Please call before coming. Gate code: #1234"    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  [Start Job] [Call Customer] [Message] [Cancel Job]    │
└──────────────────────────────────────────────────────────┘
```

#### API Calls

```typescript
// Get job details
const job = await requestApi.getRequest(jobId);
// Returns different data based on assignment status

// For available jobs: partial customer info
// For assigned jobs: full customer contact details
```

---

### 6. 📜 Job History (`/provider/history`)

**Purpose:** View all past jobs (completed, cancelled, declined)

#### Tabs

```
┌────────────────────────────────────────────────────────────┐
│  Completed (45)  │  Cancelled (3)  │  Declined (12)       │
│  ─────────────                                             │
│                                                            │
│  ┌─── Completed Job ─────────────────────────────────────┐│
│  │ ✅ COMPLETED                                          ││
│  │                                                        ││
│  │ Fix Kitchen Sink                  #123   $125.00      ││
│  │                                                        ││
│  │ 📅 Completed: Oct 10, 2025                            ││
│  │ ⏱️ Duration: 2.5 hours                                ││
│  │ 💵 Earned: $125.00                                    ││
│  │                                                        ││
│  │ Customer: John D. ⭐ 5.0                              ││
│  │ 💭 "Excellent work! Very professional"                ││
│  │                                                        ││
│  │ [View Details] [View Review]                          ││
│  └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

#### API Calls

```typescript
// Get completed jobs
const completed = await providerApi.getAssignments({ status: 'completed' });

// NEW! Get cancelled jobs
const cancelled = await providerApi.getCancelledJobs();

// Declined jobs - need to add this endpoint or get from available jobs history
```

---

## API Mapping

### Complete API Reference for Provider Views

| View | Endpoint | Method | Response Type |
|------|----------|--------|---------------|
| **Dashboard Stats** | `/providers/dashboard/stats` | GET | ProviderStatsDto |
| **Dashboard Activity** | `/providers/dashboard/requests` | GET | ActivityItemDto[] |
| **Available Jobs** | `/providers/available-jobs` | GET | ServiceRequestListItemDto[] ✨ |
| **Accepted Jobs** | `/providers/accepted-jobs` | GET | ServiceRequestListItemDto[] ⭐ NEW |
| **Cancelled Jobs** | `/providers/cancelled-jobs` | GET | ServiceRequestListItemDto[] ⭐ NEW |
| **Active Work** | `/providers/assignments?status=assigned,in_progress` | GET | ProviderAssignmentDto[] |
| **Completed History** | `/providers/assignments?status=completed` | GET | ProviderAssignmentDto[] |
| **Job Details** | `/providers/requests/:id` | GET | ServiceRequestDetailDto |
| **Accept Job** | `/providers/requests/:id/action` | POST | ActionResultDto ⭐ NEW |
| **Decline Job** | `/providers/requests/:id/action` | POST | ActionResultDto ⭐ NEW |
| **Start Job** | `/providers/requests/:id/action` | POST | ActionResultDto ⭐ NEW |
| **Complete Job** | `/providers/requests/:id/action` | POST | ActionResultDto ⭐ NEW |
| **Cancel Job** | `/providers/requests/:id/action` | POST | ActionResultDto ⭐ NEW |

### ✨ Enhanced Response - Available Jobs

```typescript
interface ServiceRequestListItemDto {
  id: number;
  title: string;
  description: string;
  category: ServiceCategoryDto;
  tier: ServiceTierDto;
  address: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  estimatedHours: number;
  preferredDate: string;
  createdAt: string;
  
  // ⭐ NEW: Matching metadata
  matchScore?: number;      // 0-100, how well provider matches
  distanceMiles?: number;   // Distance from provider location
  rank?: number;            // 1-based rank among all eligible providers
  
  // Partial customer info (before assignment)
  customer?: {
    id: number;
    name: string;           // First name + Last initial
    averageRating: number;
    totalReviews: number;
  }
}
```

### ⭐ NEW: Unified Action Request

```typescript
interface ProviderActionRequest {
  action: 'accept' | 'decline' | 'start' | 'complete' | 'cancel';
  reason?: string;  // Required for decline/cancel
}

interface ProviderActionResponse {
  success: boolean;
  message: string;
  data: {
    requestId: number;
    status: string;
    nextAction?: string;
    reopened?: boolean;  // true if job was reopened for others
  }
}
```

---

## User Flows

### Flow 1: Browse and Accept Job

```
1. Provider opens Available Jobs
   └─> GET /providers/available-jobs
   
2. Browse jobs sorted by match score
   └─> See: 95% match, 2.5 miles, Rank #1
   
3. Click job card
   └─> Modal opens with full details
   └─> Partial customer info shown
   
4. Click "Accept Job"
   └─> POST /providers/requests/123/action { action: 'accept' }
   └─> Success: "Job accepted! Waiting for customer selection"
   
5. Job moves to "Accepted Jobs" tab
   └─> GET /providers/accepted-jobs
   └─> Shows: "You're Rank #1 🏆"
```

### Flow 2: Customer Selects Provider

```
1. Notification arrives: "You've been selected!"
   └─> Click notification
   
2. Navigate to Active Work page
   └─> GET /providers/assignments?status=assigned,in_progress
   
3. See full customer contact details in "Upcoming Work" section
   └─> Name, phone, email, full address
   
4. Call customer, confirm appointment
   
5. When ready, click "Start Job"
   └─> POST /providers/requests/124/action { action: 'start' }
   └─> Job moves to "In Progress" (top of same page)
```

### Flow 3: Complete Job

```
1. Provider at job site, work done
   
2. Open Active Work page
   └─> GET /providers/assignments?status=assigned,in_progress
   
3. In-progress job shown at top - click "Complete Job"
   └─> POST /providers/requests/123/action { action: 'complete' }
   └─> Success: "Job completed! Awaiting customer review"
   
4. Job moves to Completed history
   └─> GET /providers/assignments?status=completed
```

### Flow 4: Cancel Before Work (Job Reopens!)

```
1. Provider in Assigned tab, needs to cancel
   
2. Click "Cancel Job"
   └─> Modal: "⚠️ Cancelling before work starts will reopen this job for other providers"
   
3. Enter reason: "Emergency - family issue"
   
4. Confirm cancellation
   └─> POST /providers/requests/124/action 
       { action: 'cancel', reason: '...' }
   
5. Response: { reopened: true }
   └─> Show: "Job cancelled and reopened for other providers"
   └─> Customer and other eligible providers notified
```

### Flow 5: Decline After Accepting

```
1. Provider in Accepted Jobs tab
   
2. Realizes schedule conflict
   
3. Click "Decline Offer"
   └─> Modal: "Are you sure? You already accepted this job"
   
4. Enter reason: "Schedule conflict"
   
5. Confirm
   └─> POST /providers/requests/125/action 
       { action: 'decline', reason: '...' }
   
6. Job removed from Accepted list
   └─> Removed from legacy request_acceptances table
   └─> Status in request_eligible_providers: 'rejected'
```

---

## Component Specifications

### JobCard Component

```typescript
interface JobCardProps {
  job: ServiceRequestListItemDto;
  variant: 'available' | 'accepted' | 'active';
  priority?: 'in_progress' | 'assigned';  // For active variant
  view?: 'compact' | 'full' | 'split';     // Display mode
  showBadge?: boolean;  // Show "Next: 1" or "Active: 1" badge
  onAction: (action: string, reason?: string) => void;
}

// Renders differently based on variant + view:
// - available: Show match score, Accept/Decline buttons
// - accepted: Show "Waiting for selection", Decline button
// - active (in_progress, full): Large card, progress timer, Complete/Cancel
// - active (assigned, full): Start/Cancel, full customer info, location
// - active (split): Side-by-side cards for ongoing + upcoming
// - active (compact): Small card with badge for opposite state
```

### WorkToggle Component

```typescript
interface WorkToggleProps {
  activeView: 'ongoing' | 'upcoming' | 'both';
  ongoingCount: number;
  upcomingCount: number;
  onChange: (view: 'ongoing' | 'upcoming' | 'both') => void;
}

// Renders tab-like toggle:
// [Ongoing (1)] [Upcoming (1)]
// With active state underline and badge counts
// Mobile: Auto-switches to single view
// Desktop: Shows split view by default
```

### MatchBadge Component

```typescript
interface MatchBadgeProps {
  score: number;  // 0-100
  rank: number;   // 1-based
  distance: number; // miles
}

// Renders:
// 🏆 #1 BEST MATCH • 95% • 2.5 miles
```

### JobStatusBadge Component

```typescript
interface JobStatusBadgeProps {
  type: 'next' | 'active' | 'urgent';
  count?: number;
  timeUntil?: string;  // "3 hours", "30 minutes"
}

// Renders contextual badges:
// 📋 Next: 1
// 🔨 Active: 1  
// 🔥 URGENT - Starts in 30 min
```

### ActionModal Component

```typescript
interface ActionModalProps {
  action: 'accept' | 'decline' | 'start' | 'complete' | 'cancel';
  job: ServiceRequestListItemDto;
  onConfirm: (reason?: string) => Promise<void>;
  onCancel: () => void;
}

// Shows different content based on action:
// - accept: Confirm acceptance
// - decline: Require reason
// - cancel (assigned): Warning about reopening
// - cancel (in_progress): Warning about NOT reopening
// - start: Confirm start time
// - complete: Confirm completion
```

---

## Notification Handling

### Notification Types & Actions

| Notification Type | Click Action | Navigate To |
|------------------|--------------|-------------|
| `new_assignment` | View job | `/provider/jobs/available` + open modal |
| `assignment_selected` | View assignment | `/provider/assignments` (opens assigned job) |
| `assignment_not_selected` | See why | `/provider/jobs/available` (show feedback) |
| `job_started` | View progress | `/provider/assignments` (scrolls to in-progress) |
| `job_completed` | View completion | `/provider/history` (Completed tab) |
| `job_cancelled_by_customer` | See details | `/provider/history` (Cancelled tab) |
| `job_reopened` | View reopened job | `/provider/jobs/available` + open modal |

### Implementation

```typescript
// In notification click handler
const handleNotificationClick = (notification: NotificationDto) => {
  switch (notification.type) {
    case 'new_assignment':
      navigate('/provider/jobs/available');
      // Auto-open modal for the specific job
      openJobModal(notification.metadata.requestId);
      break;
      
    case 'assignment_selected':
      navigate('/provider/assignments');
      // Auto-focus on the assigned job
      scrollToJob(notification.metadata.requestId);
      break;
      
    case 'job_reopened':
      navigate('/provider/jobs/available');
      openJobModal(notification.metadata.requestId);
      toast.info('This job is available again!');
      break;
      
    // ... other cases
  }
};
```

---

## Implementation Checklist

### Phase 1: API Layer (Do First!)

- [ ] **Update `realApi.ts`**
  - [ ] Add `getAcceptedPendingJobs()` ⭐ NEW
  - [ ] Add `getCancelledJobs()` ⭐ NEW
  - [ ] Add `performAction(requestId, action, reason?)` ⭐ NEW
  - [ ] Update `ServiceRequestListItemDto` type with matching metadata
  - [ ] Add `ProviderActionRequest` and `ProviderActionResponse` types

### Phase 2: Core Components

- [ ] **Create `MatchBadge.tsx`**
  - [ ] Show score, rank, distance
  - [ ] Visual indicator for top 3 ranks
  - [ ] Tooltip explaining what metrics mean

- [ ] **Create `JobStatusBadge.tsx`** ⭐ NEW
  - [ ] "Next: N" badge for upcoming jobs
  - [ ] "Active: N" badge for ongoing work
  - [ ] "URGENT" warning for imminent jobs
  - [ ] Time-aware styling (red if < 1 hour)

- [ ] **Create `WorkToggle.tsx`** ⭐ NEW
  - [ ] Tab-style toggle: Ongoing | Upcoming
  - [ ] Badge counts on each tab
  - [ ] Responsive: auto-collapse on mobile
  - [ ] Keyboard accessible

- [ ] **Update `JobCard.tsx`**
  - [ ] Support 3 variants: available, accepted, active
  - [ ] Support 3 view modes: compact, split, full
  - [ ] Progressive disclosure of customer info
  - [ ] Conditional action buttons
  - [ ] Match score display for available/accepted
  - [ ] Time/distance awareness for active jobs

- [ ] **Create `ActionModal.tsx`**
  - [ ] Handle all 5 actions: accept, decline, start, complete, cancel
  - [ ] Reason input for decline/cancel
  - [ ] Different warnings based on context
  - [ ] Loading state during API call
  - [ ] Time conflict warnings

### Phase 3: Pages

- [ ] **Update `Dashboard.tsx`**
  - [ ] Add "Accepted Jobs" section
  - [ ] Add "Active Jobs" section
  - [ ] Link to detailed views
  - [ ] Real-time counts

- [ ] **Update `AvailableJobs.tsx`**
  - [ ] Display match scores prominently
  - [ ] Sort by match score by default
  - [ ] Quick accept/decline from card
  - [ ] Filter by distance, urgency

- [ ] **Create `AcceptedJobs.tsx`** ⭐ NEW
  - [ ] List jobs waiting for customer
  - [ ] Show rank and match quality
  - [ ] Allow declining
  - [ ] Show estimated wait time

- [ ] **Update `Assignments.tsx`** → **Rename to `ActiveWork.tsx`**
  - [ ] Dual-view toggle: Ongoing | Upcoming | Both (split)
  - [ ] Responsive layout: split on desktop, stacked on mobile
  - [ ] Badge notifications showing counts for opposite view
  - [ ] Time awareness: countdown timers, conflict warnings
  - [ ] **Time-based progress**: Client-side calculation (elapsed/estimated)
  - [ ] Location intelligence: calculate drive time between jobs
  - [ ] Smart warnings: "Finish current first", "Urgent - starts soon"
  - [ ] One-tap actions: call, navigate, complete, cancel
  - [ ] Sort upcoming by start time (earliest first)
  - [ ] Full customer contact for all jobs

- [ ] **Create `JobHistory.tsx`** ⭐ NEW
  - [ ] Tabs: Completed, Cancelled, Declined
  - [ ] Earnings summary for completed
  - [ ] Cancellation reasons
  - [ ] Decline stats

- [ ] **Update `JobDetails.tsx`**
  - [ ] Progressive disclosure based on status
  - [ ] Partial customer info (before assigned)
  - [ ] Full customer info (after assigned)
  - [ ] Match quality explanation

### Phase 4: Notifications

- [ ] **Update notification handler**
  - [ ] Map notification types to routes
  - [ ] Auto-open modals when needed
  - [ ] Scroll to specific job
  - [ ] Mark as read on navigation

### Phase 5: Polish

- [ ] **Loading states** for all API calls
- [ ] **Error handling** with user-friendly messages
- [ ] **Empty states** for each tab
- [ ] **Confirmation modals** for destructive actions
- [ ] **Toast notifications** for success/error
- [ ] **Real-time updates** via WebSocket (future)

---

## Summary

### What's NEW ⭐

1. **Accepted Jobs Tab** - See jobs waiting for customer decision
2. **Match Quality Display** - Show scores, ranks, distance
3. **Unified Actions** - One endpoint for all provider actions
4. **Progressive Disclosure** - Partial info → Full info
5. **Cancellation Logic** - Jobs reopen if cancelled before work
6. **Declined History** - Track all declined offers
7. **Dual-View Active Work** - Uber-inspired design for ongoing + upcoming visibility
8. **Smart Badges** - "Next: 1", "Active: 1" awareness indicators
9. **Time Intelligence** - Countdown timers, conflict warnings, urgency flags
10. **Location Awareness** - Drive time between jobs, route planning

### What's ENHANCED ✨

1. **Available Jobs** - Now shows match metadata
2. **Dashboard** - Separated accepted vs active, shows both ongoing + upcoming
3. **Job Details** - Different data based on status
4. **Notifications** - Smart navigation to right page
5. **Active Work** - Quick toggle between ongoing/upcoming, always see both states
6. **Mobile Optimization** - Responsive split→stack layout
7. **Provider Workflow** - Never miss upcoming jobs while completing current work

### Key UX Principles (Uber-Inspired) 🚗

1. **Dual Awareness** - Always see current + next job (like driver seeing next ride)
2. **Badge Notifications** - Visual cues for activity in opposite view
3. **Time Sensitivity** - Countdown timers, urgency warnings
4. **Location Context** - Distance between jobs, navigation ready
5. **One-Tap Actions** - Call customer, navigate, complete - no menu diving
6. **Smart Warnings** - Conflict detection, time overlap alerts
7. **Contextual Views** - Focus mode when needed, split view when useful

### What's UNCHANGED ✅

1. Overall provider navigation structure
2. Authentication flow
3. Profile management
4. Review system
5. Earnings tracking

---

**Ready to implement!** Start with Phase 1 (API Layer), then build components, then pages. 🚀

