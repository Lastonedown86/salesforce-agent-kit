---
description: Dynamic SOQL for runtime-constructed queries
---

# Dynamic SOQL

Build SOQL queries at runtime for flexible data access.

## Basic Dynamic Query

```apex
String objectName = 'Account';
String fieldList = 'Id, Name, Industry';
String whereClause = 'Industry = \'Technology\'';

String query = 'SELECT ' + fieldList + 
               ' FROM ' + objectName + 
               ' WHERE ' + whereClause;

List<SObject> results = Database.query(query);
```

## Safe String Building

```apex
public List<Account> searchAccounts(String searchTerm, String industry) {
    List<String> conditions = new List<String>();
    
    // Use bind variables for user input (prevents injection)
    String sanitizedSearch = '%' + String.escapeSingleQuotes(searchTerm) + '%';
    conditions.add('Name LIKE :sanitizedSearch');
    
    if (String.isNotBlank(industry)) {
        conditions.add('Industry = :industry');
    }
    
    String query = 'SELECT Id, Name, Industry FROM Account';
    
    if (!conditions.isEmpty()) {
        query += ' WHERE ' + String.join(conditions, ' AND ');
    }
    
    query += ' ORDER BY Name LIMIT 100';
    
    return Database.query(query);
}
```

## Dynamic Field Selection

```apex
public List<SObject> queryWithFields(
    String objectName, 
    List<String> fields,
    String whereClause,
    Integer queryLimit
) {
    // Validate object exists
    Schema.SObjectType sot = Schema.getGlobalDescribe().get(objectName);
    if (sot == null) {
        throw new QueryException('Invalid object: ' + objectName);
    }
    
    // Validate fields exist
    Map<String, Schema.SObjectField> fieldMap = sot.getDescribe().fields.getMap();
    List<String> validFields = new List<String>();
    
    for (String field : fields) {
        if (fieldMap.containsKey(field.toLowerCase())) {
            validFields.add(field);
        }
    }
    
    if (validFields.isEmpty()) {
        validFields.add('Id');
    }
    
    String query = 'SELECT ' + String.join(validFields, ', ') +
                   ' FROM ' + objectName;
    
    if (String.isNotBlank(whereClause)) {
        query += ' WHERE ' + whereClause;
    }
    
    if (queryLimit != null && queryLimit > 0) {
        query += ' LIMIT ' + queryLimit;
    }
    
    return Database.query(query);
}
```

## Preventing SOQL Injection

```apex
// BAD - Vulnerable to injection
String userInput = 'test\' OR Name != \'';
String query = 'SELECT Id FROM Account WHERE Name = \'' + userInput + '\'';
// Results in: SELECT Id FROM Account WHERE Name = 'test' OR Name != ''

// GOOD - Use bind variables
String userInput = 'test\' OR Name != \'';
String query = 'SELECT Id FROM Account WHERE Name = :userInput';
List<Account> results = Database.query(query);
// Bind variable is properly escaped

// GOOD - Escape single quotes for string literals
String escapedInput = String.escapeSingleQuotes(userInput);
String query = 'SELECT Id FROM Account WHERE Name = \'' + escapedInput + '\'';
```

## Dynamic Ordering

```apex
public List<Account> getAccountsSorted(String sortField, String sortOrder) {
    // Whitelist valid sort fields
    Set<String> validFields = new Set<String>{'Name', 'Industry', 'CreatedDate'};
    
    if (!validFields.contains(sortField)) {
        sortField = 'Name';
    }
    
    if (sortOrder != 'DESC') {
        sortOrder = 'ASC';
    }
    
    String query = 'SELECT Id, Name, Industry FROM Account ' +
                   'ORDER BY ' + sortField + ' ' + sortOrder + ' NULLS LAST';
    
    return Database.query(query);
}
```

## Schema-Driven Queries

```apex
// Get all accessible fields dynamically
public List<SObject> getAllFields(String objectName) {
    Schema.SObjectType sot = Schema.getGlobalDescribe().get(objectName);
    Map<String, Schema.SObjectField> fields = sot.getDescribe().fields.getMap();
    
    List<String> accessibleFields = new List<String>();
    
    for (String fieldName : fields.keySet()) {
        Schema.DescribeFieldResult dfr = fields.get(fieldName).getDescribe();
        if (dfr.isAccessible()) {
            accessibleFields.add(fieldName);
        }
    }
    
    String query = 'SELECT ' + String.join(accessibleFields, ', ') + 
                   ' FROM ' + objectName + ' LIMIT 100';
    
    return Database.query(query);
}
```

## Best Practices

1. **Use bind variables** - Always for user input
2. **Whitelist allowed values** - For field names, object names
3. **Validate schema** - Check object/field existence
4. **Escape strings** - When bind variables aren't possible
5. **Never concatenate user input directly** - SOQL injection risk
