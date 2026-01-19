---
description: Step-by-step workflows for Apex development including Batch, Queueable, and service patterns
---

# Apex Development Workflow

## Prerequisites
- Salesforce org with API access
- Salesforce CLI (sf) installed
- VS Code with Salesforce Extension Pack

---

## Workflow: Create a New Apex Class

### Step 1: Determine the Class Type
Choose the appropriate pattern:
- **Service Class**: Business logic, reusable across triggers/controllers
- **Selector Class**: SOQL queries, centralized data access
- **Domain Class**: Object-specific logic (e.g., AccountDomain)
- **Controller Class**: LWC backend, @AuraEnabled methods

### Step 2: Create the Class File
```bash
sf apex generate class --name MyService --output-dir force-app/main/default/classes
```

### Step 3: Implement the Structure
```apex
public with sharing class MyService {
    
    public static void processRecords(List<SObject> records) {
        // Business logic here
    }
}
```

### Step 4: Create Corresponding Test Class
```bash
sf apex generate class --name MyServiceTest --output-dir force-app/main/default/classes
```

---

## Workflow: Implement Batch Apex

### Step 1: Create the Batch Class
```apex
public class MyBatch implements Database.Batchable<SObject>, Database.Stateful {
    
    private Integer recordsProcessed = 0;
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name FROM Account WHERE Status__c = 'Pending'
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account acc : scope) {
            // Process each record
            recordsProcessed++;
        }
        update scope;
    }
    
    public void finish(Database.BatchableContext bc) {
        System.debug('Processed: ' + recordsProcessed);
    }
}
```

### Step 2: Add Schedulable Interface (Optional)
```apex
public class MyBatch implements Database.Batchable<SObject>, Schedulable {
    
    public void execute(SchedulableContext sc) {
        Database.executeBatch(new MyBatch(), 200);
    }
}
```

### Step 3: Test the Batch
```apex
@IsTest
static void testBatch() {
    // Create test data
    List<Account> accounts = TestDataFactory.createAccounts(200);
    
    Test.startTest();
    Database.executeBatch(new MyBatch());
    Test.stopTest();
    
    // Assert results
    System.assertEquals(200, [SELECT COUNT() FROM Account WHERE Status__c = 'Processed']);
}
```

---

## Workflow: Implement Queueable Apex

### Step 1: Create the Queueable Class
```apex
public class MyQueueable implements Queueable, Database.AllowsCallouts {
    
    private List<Id> recordIds;
    
    public MyQueueable(List<Id> recordIds) {
        this.recordIds = recordIds;
    }
    
    public void execute(QueueableContext context) {
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Id IN :recordIds];
        // Process records
        update accounts;
    }
}
```

### Step 2: Chain Queueables (If Needed)
```apex
public void execute(QueueableContext context) {
    // Process current batch
    
    if (!remainingIds.isEmpty()) {
        System.enqueueJob(new MyQueueable(remainingIds));
    }
}
```

### Step 3: Invoke the Queueable
```apex
Id jobId = System.enqueueJob(new MyQueueable(accountIds));
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **Too many SOQL queries** | Move queries outside loops, use collections |
| **CPU time exceeded** | Reduce complexity, use async processing |
| **Mixed DML error** | Separate setup objects from regular DML |
| **Uncommitted work pending** | Use @future or Queueable for callouts after DML |

---

## Related Skills
- [batch-apex.md](../skills/apex/batch-apex.md)
- [queueable-apex.md](../skills/apex/queueable-apex.md)
- [governor-limits.md](../skills/apex/governor-limits.md)
- [error-handling.md](../skills/apex/error-handling.md)
