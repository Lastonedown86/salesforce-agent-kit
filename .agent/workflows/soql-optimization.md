---
description: Step-by-step workflows for SOQL query optimization and performance tuning
---

# SOQL Optimization Workflow

## Prerequisites
- Understanding of Salesforce indexing
- Access to Developer Console or Query Plan tool

---

## Workflow: Optimize a Slow Query

### Step 1: Analyze Current Query
Use Query Plan in Developer Console:
1. Open Developer Console
2. Click **Query Editor** tab
3. Check **Use Query Plan**
4. Run your query
5. Review the plan output

### Step 2: Check Filter Selectivity
Selective filters reduce data scanned:
```apex
// ❌ Non-selective (if Status has few unique values)
SELECT Id FROM Account WHERE Status__c = 'Active'

// ✅ Selective (unique indexed field)
SELECT Id FROM Account WHERE Id = :accountId

// ✅ Selective (external ID or indexed field)
SELECT Id FROM Account WHERE External_Id__c = 'EXT-001'
```

### Step 3: Optimize Filter Order
Place most selective filters first:
```apex
// ✅ Better - indexed field first
SELECT Id FROM Account 
WHERE CreatedDate = LAST_N_DAYS:7 
AND Status__c = 'Active'
```

### Step 4: Reduce Fields Selected
```apex
// ❌ Avoid SELECT *
SELECT Id, Name, Industry, Description, ... FROM Account

// ✅ Only needed fields
SELECT Id, Name FROM Account
```

---

## Workflow: Write Efficient Relationship Queries

### Child-to-Parent (Dot Notation)
```apex
// Get Account name through Contact
SELECT Id, Name, Account.Name, Account.Industry 
FROM Contact 
WHERE AccountId != null
```

### Parent-to-Child (Subquery)
```apex
// Get Account with its Contacts
SELECT Id, Name, 
    (SELECT Id, Name, Email FROM Contacts LIMIT 5)
FROM Account 
WHERE Id = :accountId
```

### Multi-Level Relationships
```apex
// Up to 5 levels parent, 1 level child
SELECT Id, 
    Account.Name, 
    Account.Parent.Name,
    (SELECT Id, Subject FROM Tasks)
FROM Contact
```

---

## Workflow: Avoid Common Performance Issues

### Issue: SOQL in Loops
```apex
// ❌ Bad - query in loop
for (Contact c : contacts) {
    Account acc = [SELECT Name FROM Account WHERE Id = :c.AccountId];
}

// ✅ Good - query before loop
Set<Id> accountIds = new Set<Id>();
for (Contact c : contacts) {
    accountIds.add(c.AccountId);
}
Map<Id, Account> accountMap = new Map<Id, Account>(
    [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
);
for (Contact c : contacts) {
    Account acc = accountMap.get(c.AccountId);
}
```

### Issue: Non-Selective Queries on Large Objects
```apex
// ❌ Full table scan
SELECT Id FROM Account WHERE IsActive__c = true

// ✅ Add indexed filter
SELECT Id FROM Account WHERE IsActive__c = true AND CreatedDate = LAST_N_DAYS:30
```

---

## Workflow: Use Aggregate Queries

### COUNT, SUM, AVG, MIN, MAX
```apex
// Count records
Integer count = [SELECT COUNT() FROM Account WHERE Industry = 'Technology'];

// Aggregate with grouping
List<AggregateResult> results = [
    SELECT Industry, COUNT(Id) cnt, SUM(AnnualRevenue) total
    FROM Account
    GROUP BY Industry
    HAVING COUNT(Id) > 10
];

for (AggregateResult ar : results) {
    String industry = (String) ar.get('Industry');
    Integer recordCount = (Integer) ar.get('cnt');
    Decimal revenue = (Decimal) ar.get('total');
}
```

---

## Quick Reference: Index-Eligible Fields

| Field Type | Indexed by Default |
|------------|-------------------|
| Id | ✅ |
| Name | ✅ |
| CreatedDate | ✅ |
| SystemModstamp | ✅ |
| RecordTypeId | ✅ |
| External ID fields | ✅ |
| Lookup/Master-Detail | ✅ |
| Custom (request index) | ❌ (contact Salesforce) |

---

## Related Skills
- [soql-optimization.md](../skills/soql/soql-optimization.md)
- [relationship-queries.md](../skills/soql/relationship-queries.md)
