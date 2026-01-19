---
description: Bulkification patterns for triggers handling multiple records
---

# Bulkification Patterns

Always design triggers to handle 200+ records efficiently.

## The Bulkification Problem

```apex
// BAD - Not bulkified
trigger AccountTrigger on Account (after insert) {
    for (Account acc : Trigger.new) {
        // SOQL in loop - will fail at 101 records
        List<Contact> contacts = [
            SELECT Id FROM Contact WHERE AccountId = :acc.Id
        ];
        
        // DML in loop - will fail at 151 records
        Contact c = new Contact(LastName = 'Auto', AccountId = acc.Id);
        insert c;
    }
}
```

## Query Bulkification

```apex
// GOOD - Bulkified queries
trigger AccountTrigger on Account (after insert) {
    // Collect all IDs first
    Set<Id> accountIds = Trigger.newMap.keySet();
    
    // Single query outside loop
    Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
    for (Contact c : [
        SELECT Id, AccountId 
        FROM Contact 
        WHERE AccountId IN :accountIds
    ]) {
        if (!contactsByAccount.containsKey(c.AccountId)) {
            contactsByAccount.put(c.AccountId, new List<Contact>());
        }
        contactsByAccount.get(c.AccountId).add(c);
    }
    
    // Now use the map
    for (Account acc : Trigger.new) {
        List<Contact> contacts = contactsByAccount.get(acc.Id);
        // Process...
    }
}
```

## DML Bulkification

```apex
// GOOD - Bulkified DML
trigger AccountTrigger on Account (after insert) {
    List<Contact> contactsToInsert = new List<Contact>();
    
    // Collect all records to insert
    for (Account acc : Trigger.new) {
        contactsToInsert.add(new Contact(
            LastName = 'Auto Contact',
            AccountId = acc.Id
        ));
    }
    
    // Single DML outside loop
    if (!contactsToInsert.isEmpty()) {
        insert contactsToInsert;
    }
}
```

## Complex Bulkification Pattern

```apex
public class AccountTriggerHandler extends TriggerHandler {
    
    protected override void afterInsert() {
        createDefaultContacts();
        updateParentAccounts();
    }
    
    private void createDefaultContacts() {
        List<Contact> newContacts = new List<Contact>();
        
        for (Account acc : (List<Account>) Trigger.new) {
            if (acc.Type == 'Customer') {
                newContacts.add(new Contact(
                    LastName = acc.Name + ' Contact',
                    AccountId = acc.Id
                ));
            }
        }
        
        if (!newContacts.isEmpty()) {
            insert newContacts;
        }
    }
    
    private void updateParentAccounts() {
        // Collect parent IDs
        Set<Id> parentIds = new Set<Id>();
        for (Account acc : (List<Account>) Trigger.new) {
            if (acc.ParentId != null) {
                parentIds.add(acc.ParentId);
            }
        }
        
        if (parentIds.isEmpty()) {
            return;
        }
        
        // Query and update parents
        List<Account> parents = [
            SELECT Id, NumberOfLocations__c 
            FROM Account 
            WHERE Id IN :parentIds
        ];
        
        for (Account parent : parents) {
            parent.NumberOfLocations__c = (parent.NumberOfLocations__c ?? 0) + 1;
        }
        
        update parents;
    }
}
```

## Bulkification Checklist

- [ ] No SOQL inside for loops
- [ ] No DML inside for loops
- [ ] No callouts inside for loops
- [ ] Collect IDs/data in first pass, query in second
- [ ] Use Maps for lookups instead of queries
- [ ] Use Sets to avoid duplicates
- [ ] Check isEmpty() before DML
