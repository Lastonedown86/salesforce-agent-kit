---
description: CRUD/FLS enforcement for secure Apex code
---

# CRUD/FLS Enforcement

Ensure proper data access security in Apex code.

## Security Concepts

- **CRUD** - Create, Read, Update, Delete permissions on objects
- **FLS** - Field-Level Security, controls field visibility

## With Sharing Keywords

```apex
// WITH SHARING - Respects record-level sharing (default for most cases)
public with sharing class AccountService {
    public List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account];
        // Only returns records user can see
    }
}

// WITHOUT SHARING - Ignores record-level sharing (use sparingly)
public without sharing class SystemAccountService {
    public List<Account> getAllAccounts() {
        return [SELECT Id, Name FROM Account];
        // Returns all records regardless of sharing
    }
}

// INHERITED SHARING - Inherits from calling context
public inherited sharing class FlexibleService {
    // Uses calling class's sharing mode
}
```

## Declarative CRUD/FLS Enforcement

```apex
// USER_MODE - Recommended approach (Spring '23+)
public with sharing class SecureAccountService {
    
    public List<Account> getAccounts() {
        // Automatically enforces CRUD and FLS
        return [SELECT Id, Name, Industry FROM Account WITH USER_MODE];
    }
    
    public void updateAccounts(List<Account> accounts) {
        // Throws exception if user lacks access
        Database.update(accounts, AccessLevel.USER_MODE);
    }
}
```

## Programmatic CRUD Check

```apex
public with sharing class AccountController {
    
    public void createAccount(Account acc) {
        // Check object-level CREATE permission
        if (!Schema.SObjectType.Account.isCreateable()) {
            throw new SecurityException('No create access to Account');
        }
        
        // Check field-level permissions
        Map<String, Schema.SObjectField> fields = 
            Schema.SObjectType.Account.fields.getMap();
            
        if (!fields.get('Name').getDescribe().isCreateable()) {
            throw new SecurityException('No create access to Account.Name');
        }
        
        insert acc;
    }
    
    public List<Account> getAccounts() {
        // Check READ permission
        if (!Schema.SObjectType.Account.isAccessible()) {
            throw new SecurityException('No read access to Account');
        }
        
        return [SELECT Id, Name FROM Account];
    }
}
```

## Security.stripInaccessible()

```apex
public with sharing class SecureDataService {
    
    public List<Account> getAccountsSecurely() {
        List<Account> accounts = [
            SELECT Id, Name, Phone, AnnualRevenue 
            FROM Account
        ];
        
        // Strip inaccessible fields (user doesn't have FLS access)
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.READABLE,
            accounts
        );
        
        return (List<Account>) decision.getRecords();
    }
    
    public void updateAccountsSecurely(List<Account> accounts) {
        // Strip fields user can't update
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE,
            accounts
        );
        
        update decision.getRecords();
    }
}
```

## Security Checks Summary

| Method | Use Case |
|--------|----------|
| `WITH USER_MODE` | SOQL queries - auto-enforce CRUD/FLS |
| `AccessLevel.USER_MODE` | DML operations - auto-enforce |
| `isAccessible()` | Manual check for READ |
| `isCreateable()` | Manual check for CREATE |
| `isUpdateable()` | Manual check for UPDATE |
| `isDeletable()` | Manual check for DELETE |
| `stripInaccessible()` | Remove inaccessible fields |

## Best Practices

1. **Default to `with sharing`** - Unless system context needed
2. **Use `USER_MODE`** - Simplest for CRUD/FLS enforcement
3. **Document `without sharing`** - Explain why needed
4. **Check before DML** - Fail fast with clear message
5. **Use `inherited sharing`** - For utility classes called from various contexts
