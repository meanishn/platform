# Status Flow Quick Reference Guide

## 🔄 Request Status Flow (Simple View)

```
┌──────────┐
│ Customer │ Creates request
│ submits  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ PENDING                                             │
│ • Request created                                   │
│ • Waiting for providers to accept                  │
│ • Multiple providers can accept                     │
│ • Customer sees: "X providers interested"           │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Customer selects a provider
                  ▼
┌─────────────────────────────────────────────────────┐
│ ASSIGNED                                            │
│ • Provider confirmed by customer                    │
│ • Work NOT started yet                              │
│ • Customer can see provider contact info            │
│ • Provider can see customer contact info            │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Provider clicks "Start Work"
                  ▼
┌─────────────────────────────────────────────────────┐
│ IN_PROGRESS                                         │
│ • Work has started                                  │
│ • Provider actively working                         │
│ • Customer tracking progress                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Provider clicks "Mark as Complete"
                  ▼
┌─────────────────────────────────────────────────────┐
│ COMPLETED ✓                                         │
│ • Work finished                                     │
│ • Customer can leave review                         │
│ • TERMINAL STATE (no further changes)               │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Cancellation Flows

### Customer Cancels from PENDING
```
PENDING → CANCELLED
• All interested providers notified
• Job permanently cancelled
```

### Customer Cancels from ASSIGNED
```
ASSIGNED → CANCELLED
• Assigned provider notified
• Job permanently cancelled
• Does NOT reopen
```

### Provider Cancels from ASSIGNED (Special Case!)
```
ASSIGNED → PENDING (REOPENS!)
• Job goes back to marketplace
• Previously rejected providers notified
• They can accept again
• Customer gets second chance
```

### Provider Cancels from IN_PROGRESS
```
IN_PROGRESS → CANCELLED
• Job permanently cancelled
• Does NOT reopen
• May require dispute resolution
```

---

## 📊 What Each Status Means

| Status | Customer View | Provider View |
|--------|---------------|---------------|
| **Pending** | "Waiting for providers" <br> Shows count of interested providers | "Available to accept" <br> Shows in Available Jobs list |
| **Assigned** | "Provider confirmed: [Name]" <br> Can contact provider <br> Waiting for work to start | "Assignment confirmed" <br> Can contact customer <br> Ready to start work |
| **Active** (in_progress) | "Work in progress" <br> Started on [date] | "Work started" <br> Performing the work |
| **Done** (completed) | "Work completed" <br> Can leave review | "Work completed" <br> Awaiting customer review |

---

## 🎯 Key Differences by Status

### PENDING
- ✅ Multiple providers can accept
- ✅ Customer waits for interest
- ✅ No provider assigned yet
- ❌ No contact info shared

### ASSIGNED
- ✅ ONE provider confirmed
- ✅ Contact info shared both ways
- ✅ Work NOT started yet
- ✅ Provider can cancel → Job reopens

### IN_PROGRESS
- ✅ Work actively happening
- ✅ Started timestamp recorded
- ⚠️ Cancellation is serious
- ❌ Cancellation does NOT reopen

### COMPLETED
- ✅ Work finished
- ✅ Customer can review
- ❌ Cannot be changed
- ❌ Terminal state

---

## 🔔 Notification Triggers

| Action | Who Gets Notified | Notification |
|--------|------------------|--------------|
| Customer creates request | **Matched Providers** | "New Service Request Available" |
| Provider accepts | **Customer** | "A provider accepted your request" |
| Customer confirms provider | **Selected Provider** | "Assignment confirmed" |
| Customer confirms provider | **Rejected Providers** | "Customer selected another provider" |
| Provider starts work | **Customer** | "Work Started" |
| Provider completes work | **Customer** | "Job Completed - Please review!" |
| Provider cancels (assigned) | **Customer** | "Provider cancelled - Job reopened" |
| Provider cancels (assigned) | **Other Providers** | "Job Available Again" |
| Customer cancels | **Affected Provider(s)** | "Job Cancelled" |

---

## 🚨 Special Scenarios

### Scenario: Provider Backs Out Early
**Status:** ASSIGNED → PENDING (reopens)
- Provider cancels BEFORE starting work
- Job goes back to marketplace
- Other providers get second chance
- Customer doesn't need to create new request

### Scenario: Provider Backs Out Late
**Status:** IN_PROGRESS → CANCELLED
- Provider cancels AFTER starting work
- Job stays cancelled (doesn't reopen)
- Customer must create new request if needed
- May require dispute/payment handling

### Scenario: No One Accepts
**Status:** PENDING (stays pending)
- Request created
- Providers notified
- No one accepts
- Request stays pending indefinitely
- Customer should revise request details

### Scenario: Multiple Providers Accept
**Status:** PENDING (multiple interested)
- 5 providers accept
- Customer sees "5 providers interested"
- Customer picks 1
- Status → ASSIGNED to that 1
- Other 4 marked as rejected

---

## 📱 Dashboard Badge Colors

| Status | Badge Color | Use Case |
|--------|-------------|----------|
| Pending | Blue | Waiting for providers |
| Assigned | Purple | Provider selected, not started |
| Active | Amber/Orange | Work in progress |
| Completed | Green | Work finished |
| Cancelled | Red | Job cancelled |

---

## ✅ Quick Decision Tree

### For Customers:
```
Created request?
└─ Yes → Status: PENDING
   └─ Provider accepted?
      └─ Yes → Review & confirm provider
         └─ Confirmed? → Status: ASSIGNED
            └─ Provider started?
               └─ Yes → Status: IN_PROGRESS
                  └─ Provider finished?
                     └─ Yes → Status: COMPLETED
```

### For Providers:
```
Received notification?
└─ Yes → Job in "Available Jobs"
   └─ Interested?
      └─ Yes → Click "Accept"
         └─ Customer selected you?
            └─ Yes → Status: ASSIGNED, contact customer
               └─ Ready to start?
                  └─ Yes → Click "Start Work"
                     └─ Status: IN_PROGRESS
                        └─ Finished?
                           └─ Yes → Click "Complete"
                              └─ Status: COMPLETED
```

---

## 🎯 One-Sentence Summary

### PENDING
"Request is open, providers can accept, customer hasn't picked anyone yet."

### ASSIGNED
"Customer picked a provider, work hasn't started, provider can cancel & reopen job."

### IN_PROGRESS (Active)
"Work is actively happening, cancellation is serious and doesn't reopen the job."

### COMPLETED (Done)
"Work is finished, customer should review, nothing can change anymore."

---

**Use this quick reference alongside the full `USER_FLOW_DOCUMENTATION.md` for complete details.**

