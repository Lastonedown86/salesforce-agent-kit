---
description: Batch Apex patterns for processing large data volumes efficiently
---

# Batch Apex Patterns

When working with Batch Apex in Salesforce, follow these patterns and best practices.

## Database.Batchable Interface

Always implement all three required methods:

```apex
public class MyBatch implements Database.Batchable<SObject>, Database.Stateful {
    
    private Integer recordsProcessed = 0;
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name, Status__c 
            FROM Account 
            WHERE Status__c = 'Pending'
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account acc : scope) {
            acc.Status__c = 'Processed';
            recordsProcessed++;
        }
        update scope;
    }
    
    public void finish(Database.BatchableContext bc) {
        System.debug('Processed ' + recordsProcessed + ' records');
    }
}
```

## Best Practices

1. **Use Database.Stateful** when you need to maintain state across execute batches
2. **Optimal batch size** is typically 200 records - adjust based on complexity
3. **Handle partial failures** with Database.update(records, false)
4. **Chain batches** in the finish method when needed
5. **Avoid SOQL in loops** - query in start(), process in execute()

## Governor Limits Per Execute

- 50,000 SOQL queries
- 10,000 DML statements
- 12 MB heap size
- Callouts allowed if implementing Database.AllowsCallouts

## Invoking Batch Apex

```apex
// Default batch size (200)
Database.executeBatch(new MyBatch());

// Custom batch size
Database.executeBatch(new MyBatch(), 100);

// Get job ID for monitoring
Id jobId = Database.executeBatch(new MyBatch());
```

## Monitoring Batch Jobs

```apex
AsyncApexJob job = [
    SELECT Id, Status, NumberOfErrors, JobItemsProcessed, TotalJobItems
    FROM AsyncApexJob 
    WHERE Id = :jobId
];
```
