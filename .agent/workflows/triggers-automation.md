---
description: Step-by-step workflows for implementing triggers with handler framework
---

# Triggers & Automation Workflow

## Prerequisites
- Understanding of trigger events (before/after insert/update/delete/undelete)
- Familiarity with DML operations and governor limits

---

## Workflow: Implement Trigger with Handler Framework

### Step 1: Create the Trigger Handler Interface
```apex
public interface ITriggerHandler {
    void beforeInsert(List<SObject> newRecords);
    void afterInsert(List<SObject> newRecords);
    void beforeUpdate(Map<Id, SObject> oldMap, Map<Id, SObject> newMap);
    void afterUpdate(Map<Id, SObject> oldMap, Map<Id, SObject> newMap);
    void beforeDelete(Map<Id, SObject> oldMap);
    void afterDelete(Map<Id, SObject> oldMap);
    void afterUndelete(List<SObject> newRecords);
}
```

### Step 2: Create the Trigger Dispatcher
```apex
public class TriggerDispatcher {
    
    public static void run(ITriggerHandler handler) {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) {
                handler.beforeInsert(Trigger.new);
            } else if (Trigger.isUpdate) {
                handler.beforeUpdate(Trigger.oldMap, Trigger.newMap);
            } else if (Trigger.isDelete) {
                handler.beforeDelete(Trigger.oldMap);
            }
        } else if (Trigger.isAfter) {
            if (Trigger.isInsert) {
                handler.afterInsert(Trigger.new);
            } else if (Trigger.isUpdate) {
                handler.afterUpdate(Trigger.oldMap, Trigger.newMap);
            } else if (Trigger.isDelete) {
                handler.afterDelete(Trigger.oldMap);
            } else if (Trigger.isUndelete) {
                handler.afterUndelete(Trigger.new);
            }
        }
    }
}
```

### Step 3: Create the Handler Class
```apex
public class AccountTriggerHandler implements ITriggerHandler {
    
    public void beforeInsert(List<SObject> newRecords) {
        List<Account> accounts = (List<Account>) newRecords;
        for (Account acc : accounts) {
            if (String.isBlank(acc.Description)) {
                acc.Description = 'Created via trigger';
            }
        }
    }
    
    public void afterInsert(List<SObject> newRecords) {
        // Create related records, send notifications, etc.
    }
    
    public void beforeUpdate(Map<Id, SObject> oldMap, Map<Id, SObject> newMap) {
        Map<Id, Account> oldAccounts = (Map<Id, Account>) oldMap;
        Map<Id, Account> newAccounts = (Map<Id, Account>) newMap;
        
        for (Id accId : newAccounts.keySet()) {
            Account oldAcc = oldAccounts.get(accId);
            Account newAcc = newAccounts.get(accId);
            
            if (oldAcc.Status__c != newAcc.Status__c) {
                // Handle status change
            }
        }
    }
    
    public void afterUpdate(Map<Id, SObject> oldMap, Map<Id, SObject> newMap) { }
    public void beforeDelete(Map<Id, SObject> oldMap) { }
    public void afterDelete(Map<Id, SObject> oldMap) { }
    public void afterUndelete(List<SObject> newRecords) { }
}
```

### Step 4: Create the Trigger
```apex
trigger AccountTrigger on Account (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    TriggerDispatcher.run(new AccountTriggerHandler());
}
```

---

## Workflow: Add Recursion Prevention

### Step 1: Create Recursion Control Class
```apex
public class TriggerControl {
    
    private static Set<Id> processedIds = new Set<Id>();
    private static Boolean isExecuting = false;
    
    public static Boolean isRecursive(Id recordId) {
        return processedIds.contains(recordId);
    }
    
    public static void markProcessed(Id recordId) {
        processedIds.add(recordId);
    }
    
    public static void reset() {
        processedIds.clear();
        isExecuting = false;
    }
}
```

### Step 2: Use in Handler
```apex
public void afterUpdate(Map<Id, SObject> oldMap, Map<Id, SObject> newMap) {
    List<Account> toProcess = new List<Account>();
    
    for (Account acc : (List<Account>) newMap.values()) {
        if (!TriggerControl.isRecursive(acc.Id)) {
            toProcess.add(acc);
            TriggerControl.markProcessed(acc.Id);
        }
    }
    
    if (!toProcess.isEmpty()) {
        processAccounts(toProcess);
    }
}
```

---

## Workflow: Test Trigger Behavior

### Step 1: Create Test Class
```apex
@IsTest
private class AccountTriggerHandlerTest {
    
    @TestSetup
    static void setup() {
        List<Account> accounts = TestDataFactory.createAccounts(5);
    }
    
    @IsTest
    static void testBeforeInsert() {
        Account acc = new Account(Name = 'Test Account');
        
        Test.startTest();
        insert acc;
        Test.stopTest();
        
        Account inserted = [SELECT Description FROM Account WHERE Id = :acc.Id];
        System.assertEquals('Created via trigger', inserted.Description);
    }
    
    @IsTest
    static void testAfterUpdate_StatusChange() {
        Account acc = [SELECT Id, Status__c FROM Account LIMIT 1];
        acc.Status__c = 'Active';
        
        Test.startTest();
        update acc;
        Test.stopTest();
        
        // Assert expected behavior
    }
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **Maximum trigger depth exceeded** | Add recursion prevention |
| **Mixed DML error** | Separate setup object DML into @future |
| **SOQL in loops** | Bulkify - query before loop, use Maps |
| **Required field missing** | Set in before trigger, not after |

---

## Related Skills
- [trigger-handler.md](../skills/triggers/trigger-handler.md)
- [recursion-prevention.md](../skills/triggers/recursion-prevention.md)
- [trigger-context.md](../skills/triggers/trigger-context.md)
- [bulkification.md](../skills/triggers/bulkification.md)
