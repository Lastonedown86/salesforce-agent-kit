---
description: Recursion prevention strategies for Salesforce triggers
---

# Recursion Prevention

Prevent infinite loops when triggers cause re-entry or update the same records.

## Static Variable Pattern

```apex
public class TriggerRecursionControl {
    
    // Track if trigger has already run
    private static Boolean hasRun = false;
    
    public static Boolean isFirstRun() {
        if (hasRun) {
            return false;
        }
        hasRun = true;
        return true;
    }
    
    public static void reset() {
        hasRun = false;
    }
}

// In trigger handler
protected override void afterUpdate() {
    if (!TriggerRecursionControl.isFirstRun()) {
        return;
    }
    // Proceed with logic
}
```

## Per-Record Tracking (Recommended)

```apex
public class RecursionTracker {
    
    // Track which records have been processed
    private static Set<Id> processedIds = new Set<Id>();
    
    public static Boolean hasBeenProcessed(Id recordId) {
        return processedIds.contains(recordId);
    }
    
    public static void markAsProcessed(Id recordId) {
        processedIds.add(recordId);
    }
    
    public static void markAsProcessed(Set<Id> recordIds) {
        processedIds.addAll(recordIds);
    }
    
    public static Set<Id> filterUnprocessed(Set<Id> recordIds) {
        Set<Id> unprocessed = new Set<Id>();
        for (Id recordId : recordIds) {
            if (!processedIds.contains(recordId)) {
                unprocessed.add(recordId);
            }
        }
        return unprocessed;
    }
    
    // Reset for testing
    @TestVisible
    private static void reset() {
        processedIds.clear();
    }
}
```

## Usage in Trigger Handler

```apex
protected override void afterUpdate() {
    // Filter to only unprocessed records
    Set<Id> recordIds = Trigger.newMap.keySet();
    Set<Id> toProcess = RecursionTracker.filterUnprocessed(recordIds);
    
    if (toProcess.isEmpty()) {
        return;
    }
    
    // Mark as processed before doing work
    RecursionTracker.markAsProcessed(toProcess);
    
    // Now process only new records
    List<Account> accountsToProcess = new List<Account>();
    for (Id accId : toProcess) {
        accountsToProcess.add((Account) Trigger.newMap.get(accId));
    }
    
    processAccounts(accountsToProcess);
}
```

## When Recursion Happens

1. **Workflow field updates** - Cause re-entry of before/after update triggers
2. **Process Builder updates** - Same as workflow
3. **Trigger updates same object** - Direct recursion
4. **Circular relationships** - Account updates Contact updates Account

## Best Practices

1. **Use per-record tracking** - Simple boolean only prevents ALL re-entry
2. **Mark before processing** - Prevents race conditions
3. **Reset in test setup** - Static variables persist across tests
4. **Be specific** - Track by operation type if needed (insert vs update)
