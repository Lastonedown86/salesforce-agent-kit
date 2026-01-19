---
description: Trigger handler framework pattern for maintainable trigger code
---

# Trigger Handler Framework

Use a handler framework to keep triggers clean, testable, and maintainable.

## Single Trigger Per Object

Only one trigger per object, per event type:

```apex
trigger AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    AccountTriggerHandler handler = new AccountTriggerHandler();
    handler.run();
}
```

## Base Handler Class

```apex
public virtual class TriggerHandler {
    
    // Context variables
    protected Boolean isExecuting;
    protected Integer batchSize;
    
    public TriggerHandler() {
        this.isExecuting = Trigger.isExecuting;
        this.batchSize = Trigger.size;
    }
    
    public void run() {
        if (TriggerHandler.isBypassed(getHandlerName())) {
            return;
        }
        
        switch on Trigger.operationType {
            when BEFORE_INSERT { beforeInsert(); }
            when BEFORE_UPDATE { beforeUpdate(); }
            when BEFORE_DELETE { beforeDelete(); }
            when AFTER_INSERT { afterInsert(); }
            when AFTER_UPDATE { afterUpdate(); }
            when AFTER_DELETE { afterDelete(); }
            when AFTER_UNDELETE { afterUndelete(); }
        }
    }
    
    // Override these in subclass
    protected virtual void beforeInsert() {}
    protected virtual void beforeUpdate() {}
    protected virtual void beforeDelete() {}
    protected virtual void afterInsert() {}
    protected virtual void afterUpdate() {}
    protected virtual void afterDelete() {}
    protected virtual void afterUndelete() {}
    
    // Bypass mechanism
    private static Set<String> bypassedHandlers = new Set<String>();
    
    public static void bypass(String handlerName) {
        bypassedHandlers.add(handlerName);
    }
    
    public static void clearBypass(String handlerName) {
        bypassedHandlers.remove(handlerName);
    }
    
    public static Boolean isBypassed(String handlerName) {
        return bypassedHandlers.contains(handlerName);
    }
    
    private String getHandlerName() {
        return String.valueOf(this).split(':')[0];
    }
}
```

## Concrete Handler Implementation

```apex
public class AccountTriggerHandler extends TriggerHandler {
    
    private List<Account> newRecords;
    private List<Account> oldRecords;
    private Map<Id, Account> newMap;
    private Map<Id, Account> oldMap;
    
    public AccountTriggerHandler() {
        super();
        this.newRecords = (List<Account>) Trigger.new;
        this.oldRecords = (List<Account>) Trigger.old;
        this.newMap = (Map<Id, Account>) Trigger.newMap;
        this.oldMap = (Map<Id, Account>) Trigger.oldMap;
    }
    
    protected override void beforeInsert() {
        setDefaultValues();
    }
    
    protected override void afterUpdate() {
        syncRelatedContacts();
    }
    
    private void setDefaultValues() {
        for (Account acc : newRecords) {
            if (acc.Industry == null) {
                acc.Industry = 'Other';
            }
        }
    }
    
    private void syncRelatedContacts() {
        // Delegate to service class
        AccountService.syncContacts(newRecords, oldMap);
    }
}
```

## Benefits of Handler Pattern

1. **Single trigger per object** - Easy to maintain execution order
2. **Context-aware** - Automatic routing to correct method
3. **Bypass mechanism** - Disable triggers for data loads
4. **Testable** - Service logic separated from trigger context
5. **Consistent** - Same pattern across all objects
