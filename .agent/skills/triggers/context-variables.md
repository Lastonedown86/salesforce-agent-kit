---
description: Trigger context variables and their proper usage
---

# Trigger Context Variables

Understanding trigger context is essential for writing correct trigger logic.

## Context Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `Trigger.new` | List<SObject> | New versions of records (insert, update, undelete) |
| `Trigger.old` | List<SObject> | Old versions of records (update, delete) |
| `Trigger.newMap` | Map<Id, SObject> | Map of new records by Id |
| `Trigger.oldMap` | Map<Id, SObject> | Map of old records by Id |
| `Trigger.isInsert` | Boolean | True if insert operation |
| `Trigger.isUpdate` | Boolean | True if update operation |
| `Trigger.isDelete` | Boolean | True if delete operation |
| `Trigger.isUndelete` | Boolean | True if undelete operation |
| `Trigger.isBefore` | Boolean | True if before trigger |
| `Trigger.isAfter` | Boolean | True if after trigger |
| `Trigger.isExecuting` | Boolean | True if in trigger context |
| `Trigger.size` | Integer | Number of records in trigger |
| `Trigger.operationType` | System.TriggerOperation | Enum of operation type |

## Context Availability by Event

| Context | before insert | after insert | before update | after update | before delete | after delete | after undelete |
|---------|:-------------:|:------------:|:-------------:|:------------:|:-------------:|:------------:|:--------------:|
| new | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| newMap | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| old | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| oldMap | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |

## Detecting Field Changes

```apex
protected override void afterUpdate() {
    List<Account> changedAccounts = new List<Account>();
    
    for (Account acc : (List<Account>) Trigger.new) {
        Account oldAcc = (Account) Trigger.oldMap.get(acc.Id);
        
        // Check if specific field changed
        if (acc.Status__c != oldAcc.Status__c) {
            changedAccounts.add(acc);
        }
    }
    
    if (!changedAccounts.isEmpty()) {
        processStatusChange(changedAccounts);
    }
}
```

## Using operationType (Modern Approach)

```apex
public void run() {
    switch on Trigger.operationType {
        when BEFORE_INSERT {
            handleBeforeInsert();
        }
        when BEFORE_UPDATE {
            handleBeforeUpdate();
        }
        when AFTER_INSERT {
            handleAfterInsert();
        }
        when AFTER_UPDATE {
            handleAfterUpdate();
        }
        when BEFORE_DELETE {
            handleBeforeDelete();
        }
        when AFTER_DELETE {
            handleAfterDelete();
        }
        when AFTER_UNDELETE {
            handleAfterUndelete();
        }
    }
}
```

## Best Practices

1. **Cast to specific type** - `(List<Account>) Trigger.new`
2. **Use newMap for lookups** - Faster than iterating through list
3. **Always check for changes** in update triggers - Avoid unnecessary processing
4. **Use operationType enum** - Cleaner than multiple boolean checks
5. **Never modify Trigger.old** - It's read-only
