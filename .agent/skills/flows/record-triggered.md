---
description: Record-triggered flow best practices and optimization
---

# Record-Triggered Flow Best Practices

Optimize record-triggered flows for performance and reliability.

## Flow Types

| Type | When It Runs | Use Case |
|------|--------------|----------|
| Before Save | Before record saved | Field updates, validation |
| After Save | After record saved | Create related records, callouts |
| After Save (Run Async) | Runs in background | Heavy processing, callouts |

## Before Save Optimization

Before-save flows run in same transaction, no DML limits consumed:

```
✓ Update fields on triggering record (no DML needed)
✓ Set field values based on related data
✓ Complex field calculations

✗ Create/update other records (use After Save)
✗ Send emails (use After Save)
✗ Make callouts (use After Save Async)
```

```
// Before Save Flow - Fast and Efficient
Entry: Account - Before Save

Get Records: Get Parent Account
└── Filter: Id = {!$Record.ParentId}

Assignment: Set Fields
├── {!$Record.Parent_Industry__c} = {!parentAccount.Industry}
└── {!$Record.Hierarchy_Level__c} = "Child"

// No DML needed - changes apply automatically
```

## After Save for Related Objects

```
// After Save Flow - Create Related Task
Entry: Opportunity - After Save
Conditions: 
├── StageName = 'Closed Won'
└── ISNEW() OR ISCHANGED(StageName)

Create Records: Create Follow-up Task
├── Subject: "Follow up on {!$Record.Name}"
├── WhatId: {!$Record.Id}
├── OwnerId: {!$Record.OwnerId}
└── ActivityDate: {!$Flow.CurrentDate} + 7
```

## Optimization Patterns

### 1. Entry Conditions
```
// Only process when needed
Entry Conditions:
- ISCHANGED({!$Record.Status__c})  // Only on change
- {!$Record.RecordType.DeveloperName} = 'Customer'  // Specific type
- NOT(ISBLANK({!$Record.Email}))  // Required field present
```

### 2. Scheduled Paths
```
// Delay execution until appropriate time
After Save (Scheduled Path):
├── Time: 1 Hour After Created Date
├── Condition: Status = 'Pending'
└── Action: Send Reminder Email
```

### 3. Batch Processing
```
// Process in chunks for large volumes
Loop through: {!relatedRecords}
├── Assignment: Add to {!recordsToUpdate}
└── Decision: Batch Size Reached?
    └── YES: Update Records, Clear Collection
    
// Final update after loop for remaining
Update Records: {!recordsToUpdate}
```

## Governor Limit Awareness

| Limit | Per Transaction |
|-------|-----------------|
| Get Records | 100 |
| DML operations | 150 |
| Loop iterations | 2000 |
| CPU time | 10,000ms |

## Best Practices

1. **Use Before Save** when only updating trigger record
2. **Minimize Get Records** - Avoid in loops
3. **Use entry conditions** to reduce executions
4. **Use Scheduled Paths** for time-based actions
5. **Run Asynchronously** for heavy processing
6. **Test in bulk** - Flows trigger for each record
