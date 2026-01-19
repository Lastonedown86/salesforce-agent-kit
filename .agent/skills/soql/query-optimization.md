---
description: SOQL query optimization for better performance
---

# Query Optimization Patterns

Write efficient SOQL queries that avoid governor limits.

## Selective Queries

A query is selective when it uses indexed fields:

```apex
// GOOD - Uses indexed field (Id)
SELECT Id, Name FROM Account WHERE Id = :accountId

// GOOD - Uses indexed field (unique external ID)
SELECT Id FROM Account WHERE External_Id__c = 'ABC123'

// GOOD - Uses standard indexed fields
SELECT Id FROM Contact WHERE Email = 'test@example.com'

// BAD - Non-selective (scans all records)
SELECT Id FROM Account WHERE Description LIKE '%test%'
```

## Indexed Fields (Selective by Default)

- Id
- Name
- OwnerId
- CreatedDate
- SystemModstamp
- RecordTypeId
- Lookup/Master-Detail fields
- External ID fields
- Unique fields

## Limiting Query Results

```apex
// Always use LIMIT when full results aren't needed
List<Account> recentAccounts = [
    SELECT Id, Name 
    FROM Account 
    ORDER BY CreatedDate DESC 
    LIMIT 100
];

// For pagination
Integer pageSize = 20;
Integer offset = (pageNumber - 1) * pageSize;
List<Account> accountPage = [
    SELECT Id, Name 
    FROM Account 
    ORDER BY Name 
    LIMIT :pageSize 
    OFFSET :offset
];
```

## Query Only Needed Fields

```apex
// BAD - Selects all fields, wastes heap
List<Account> accounts = [SELECT Id, Name, Industry, Description, 
    BillingStreet, BillingCity, BillingState, Phone, Fax,
    Website, AnnualRevenue, NumberOfEmployees, ... 
    FROM Account];

// GOOD - Only what's needed
List<Account> accounts = [
    SELECT Id, Name, Industry 
    FROM Account
];
```

## Aggregate Queries

```apex
// Count records efficiently
Integer accountCount = [SELECT COUNT() FROM Account WHERE Industry = 'Technology'];

// Use aggregate functions
AggregateResult[] results = [
    SELECT Industry, COUNT(Id) total, SUM(AnnualRevenue) revenue
    FROM Account
    GROUP BY Industry
    HAVING COUNT(Id) > 10
];

for (AggregateResult ar : results) {
    String industry = (String) ar.get('Industry');
    Integer total = (Integer) ar.get('total');
    Decimal revenue = (Decimal) ar.get('revenue');
}
```

## Avoid Query Anti-Patterns

```apex
// BAD - Query in loop
for (Account acc : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
}

// GOOD - Query once, use Map
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccount.containsKey(c.AccountId)) {
        contactsByAccount.put(c.AccountId, new List<Contact>());
    }
    contactsByAccount.get(c.AccountId).add(c);
}

// BAD - Unnecessary subquery
SELECT Id, (SELECT Id FROM Contacts) FROM Account  // When you don't need contacts

// GOOD - Simple query
SELECT Id FROM Account
```

## Query Plan Analysis

Use Developer Console's Query Plan tool:

```apex
// In Developer Console > Query Editor
// Click "Query Plan" button

SELECT Id, Name 
FROM Account 
WHERE Industry = 'Technology' 
AND CreatedDate = LAST_N_DAYS:30
```

Check for:
- **Cost** - Lower is better (< 1 is ideal)
- **Cardinality** - Estimated rows returned
- **Fields** - Which indexes are used
