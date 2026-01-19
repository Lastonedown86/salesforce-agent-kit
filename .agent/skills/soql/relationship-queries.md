---
description: Relationship queries for parent and child data
---

# Relationship Queries

Traverse object relationships in a single SOQL query.

## Parent-to-Child (Subquery)

Query child records through the relationship name:

```apex
// Get Accounts with their Contacts
List<Account> accountsWithContacts = [
    SELECT Id, Name, 
        (SELECT Id, FirstName, LastName, Email 
         FROM Contacts 
         WHERE IsActive__c = true
         ORDER BY LastName)
    FROM Account 
    WHERE Industry = 'Technology'
];

// Process results
for (Account acc : accountsWithContacts) {
    System.debug('Account: ' + acc.Name);
    for (Contact c : acc.Contacts) {  // Use relationship name
        System.debug('  Contact: ' + c.FirstName + ' ' + c.LastName);
    }
}
```

## Child-to-Parent (Dot Notation)

Query parent fields through the relationship:

```apex
// Get Contacts with Account info
List<Contact> contacts = [
    SELECT Id, FirstName, LastName,
           Account.Name,           // Parent field
           Account.Industry,       // Another parent field
           Account.Owner.Name      // Grandparent field
    FROM Contact 
    WHERE Account.Industry = 'Technology'
];

// Access parent data
for (Contact c : contacts) {
    System.debug(c.FirstName + ' works at ' + c.Account.Name);
}
```

## Custom Relationship Names

```apex
// Custom child relationship (append __r to relationship name)
SELECT Id, Name,
    (SELECT Id, Name FROM Custom_Children__r)
FROM Parent_Object__c

// Custom parent relationship
SELECT Id, Name, 
       Custom_Parent__r.Name,
       Custom_Parent__r.Custom_Field__c
FROM Child_Object__c
```

## Multiple Subqueries

```apex
SELECT Id, Name,
    (SELECT Id, FirstName, LastName FROM Contacts),
    (SELECT Id, Subject, Status FROM Cases),
    (SELECT Id, Amount, StageName FROM Opportunities 
     WHERE IsClosed = false)
FROM Account
```

## Semi-Joins and Anti-Joins

```apex
// Semi-join: Accounts WITH Opportunities
SELECT Id, Name 
FROM Account 
WHERE Id IN (SELECT AccountId FROM Opportunity WHERE Amount > 100000)

// Anti-join: Accounts WITHOUT Contacts
SELECT Id, Name 
FROM Account 
WHERE Id NOT IN (SELECT AccountId FROM Contact)

// Semi-join with conditions
SELECT Id, Name 
FROM Account 
WHERE Id IN (
    SELECT AccountId 
    FROM Opportunity 
    WHERE StageName = 'Closed Won' 
    AND CloseDate = THIS_YEAR
)
```

## Polymorphic Relationships

Query fields from polymorphic relationships (What, Who):

```apex
// Query Task with polymorphic What field
SELECT Id, Subject,
       What.Name,
       TYPEOF What
           WHEN Account THEN Phone, Industry
           WHEN Opportunity THEN Amount, StageName
       END
FROM Task
WHERE WhatId != null
```

## Limits and Considerations

| Limit | Value |
|-------|-------|
| Subqueries per query | 20 |
| Parent levels | 5 (up the hierarchy) |
| Child levels | 1 (down the hierarchy) |

## Best Practices

1. **Use subqueries sparingly** - Each consumes heap
2. **Filter child records** - Don't fetch all, use WHERE
3. **Order child records** - Consistent results
4. **Check for null parents** - Before accessing fields
5. **Consider separate queries** - If child count is large
