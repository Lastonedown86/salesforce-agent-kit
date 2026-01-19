---
description: Error handling patterns for robust Apex code
---

# Error Handling Patterns

Proper error handling ensures graceful failure and easier debugging in Salesforce applications.

## Try-Catch-Finally Pattern

```apex
public class AccountService {
    
    public void processAccounts(List<Account> accounts) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            // Risky operation
            update accounts;
            callExternalService();
            
        } catch (DmlException e) {
            Database.rollback(sp);
            logError('DML Error', e);
            throw new AccountServiceException('Failed to update accounts: ' + e.getMessage());
            
        } catch (CalloutException e) {
            Database.rollback(sp);
            logError('Callout Error', e);
            throw new AccountServiceException('External service unavailable');
            
        } finally {
            // Cleanup code runs regardless of success/failure
            cleanupResources();
        }
    }
    
    private void logError(String context, Exception e) {
        System.debug(LoggingLevel.ERROR, context + ': ' + e.getMessage());
        System.debug(LoggingLevel.ERROR, 'Stack: ' + e.getStackTraceString());
    }
}
```

## Custom Exception Classes

```apex
public class AccountServiceException extends Exception {}

public class ValidationException extends Exception {
    public List<String> errors { get; private set; }
    
    public ValidationException(List<String> errors) {
        this.errors = errors;
        this.setMessage(String.join(errors, '; '));
    }
}
```

## Database.SaveResult Handling

```apex
public void updateWithPartialSuccess(List<Account> accounts) {
    List<String> errors = new List<String>();
    
    Database.SaveResult[] results = Database.update(accounts, false);
    
    for (Integer i = 0; i < results.size(); i++) {
        if (!results[i].isSuccess()) {
            for (Database.Error err : results[i].getErrors()) {
                errors.add(accounts[i].Name + ': ' + err.getMessage());
            }
        }
    }
    
    if (!errors.isEmpty()) {
        // Log errors but don't throw - partial success allowed
        System.debug('Partial failures: ' + String.join(errors, '\n'));
    }
}
```

## Validation Before DML

```apex
public class AccountValidator {
    
    public ValidationResult validate(Account acc) {
        ValidationResult result = new ValidationResult();
        
        if (String.isBlank(acc.Name)) {
            result.addError('Name is required');
        }
        
        if (acc.AnnualRevenue != null && acc.AnnualRevenue < 0) {
            result.addError('Annual Revenue cannot be negative');
        }
        
        return result;
    }
}

public class ValidationResult {
    public Boolean isValid { get { return errors.isEmpty(); } }
    public List<String> errors { get; private set; }
    
    public ValidationResult() {
        this.errors = new List<String>();
    }
    
    public void addError(String message) {
        errors.add(message);
    }
}
```

## Best Practices

1. **Use specific exception types** - Catch DmlException, CalloutException separately
2. **Always log before rethrowing** - Include stack trace and context
3. **Use Savepoints** for multi-step transactions
4. **Create custom exceptions** for business logic errors
5. **Handle partial DML failures** with Database.SaveResult
6. **Validate early** - Check data before DML operations
7. **Never swallow exceptions silently** - At minimum, log them
