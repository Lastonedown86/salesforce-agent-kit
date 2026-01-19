---
description: Governor limits awareness and strategies to avoid hitting limits
---

# Governor Limits Awareness

Salesforce governor limits exist to ensure efficient use of shared resources. Understanding and respecting these limits is critical for scalable code.

## Key Governor Limits

| Limit | Synchronous | Asynchronous |
|-------|-------------|--------------|
| SOQL queries | 100 | 200 |
| SOQL rows retrieved | 50,000 | 50,000 |
| DML statements | 150 | 150 |
| DML rows | 10,000 | 10,000 |
| Heap size | 6 MB | 12 MB |
| CPU time | 10,000 ms | 60,000 ms |
| Callouts | 100 | 100 |
| Future calls | 50 | 0 |

## Checking Limits Programmatically

```apex
// Check remaining SOQL queries
Integer queriesRemaining = Limits.getLimitQueries() - Limits.getQueries();

// Check heap usage
Integer heapUsed = Limits.getHeapSize();
Integer heapLimit = Limits.getLimitHeapSize();

// Log all limits
System.debug('SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
System.debug('DML: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
System.debug('Heap: ' + Limits.getHeapSize() + '/' + Limits.getLimitHeapSize());
```

## Common Limit Violations and Solutions

### SOQL in Loops (Query Limit)
```apex
// BAD - Query in loop
for (Account acc : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
}

// GOOD - Query outside loop
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccount.containsKey(c.AccountId)) {
        contactsByAccount.put(c.AccountId, new List<Contact>());
    }
    contactsByAccount.get(c.AccountId).add(c);
}
```

### DML in Loops (DML Limit)
```apex
// BAD - DML in loop
for (Account acc : accounts) {
    acc.Status__c = 'Active';
    update acc;
}

// GOOD - Bulkified DML
for (Account acc : accounts) {
    acc.Status__c = 'Active';
}
update accounts;
```

### Large Query Results (Row Limit)
```apex
// Use LIMIT and OFFSET for pagination
List<Account> batch1 = [SELECT Id FROM Account LIMIT 10000];
List<Account> batch2 = [SELECT Id FROM Account LIMIT 10000 OFFSET 10000];

// Or use Batch Apex for very large datasets
Database.executeBatch(new MyBatch(), 200);
```

## Best Practices

1. **Bulkify all code** - Design for 200+ records, not 1
2. **Query only needed fields** - Reduces heap usage
3. **Use Maps for lookups** - Avoid queries in loops
4. **Aggregate queries** - Use COUNT(), SUM() when possible
5. **Monitor with Limits class** - Check before heavy operations
6. **Use async processing** - Higher limits, better UX
