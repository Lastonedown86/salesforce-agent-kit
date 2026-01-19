---
description: Decision guide for when to use Triggers vs Flows
---

# Trigger vs Flow Decision Guide

Choose the right automation tool for each use case.

## Decision Matrix

| Consideration | Use Trigger | Use Flow |
|---------------|:-----------:|:--------:|
| Complex logic with loops | ✓ | |
| Bulkified operations (200+ records) | ✓ | |
| Error handling with try-catch | ✓ | |
| Callouts to external systems | ✓ | |
| Recursion control needed | ✓ | |
| Simple field updates | | ✓ |
| Admin-maintainable logic | | ✓ |
| No Apex developers available | | ✓ |
| Send emails with templates | | ✓ |
| Create tasks/chatter posts | | ✓ |
| Screen interactions | | ✓ |

## When to Use Triggers

1. **Complex business logic** - Multiple conditions, calculations, lookups
2. **High-volume operations** - Processing thousands of records
3. **External integrations** - HTTP callouts, platform events
4. **Transaction control** - Savepoints, rollbacks
5. **Cross-object updates** - Complex relationship traversal
6. **Performance critical** - Need full control over query optimization

## When to Use Flows

1. **Simple field updates** - Copy values, set defaults
2. **Declarative automation** - No code maintenance
3. **Quick changes** - Admins can modify without deployment
4. **Email/notification** - Built-in email actions
5. **Approval processes** - Native integration
6. **User interaction** - Screen flows for guided processes

## Execution Order

Understanding order of execution helps avoid conflicts:

1. System validation rules
2. **Before triggers**
3. Custom validation rules
4. Duplicate rules
5. **After triggers**  
6. Assignment rules
7. Auto-response rules
8. Workflow rules (legacy)
9. Escalation rules
10. **Record-triggered flows**
11. Entitlement rules
12. Roll-up summary calculations

## Hybrid Approach

Use Invocable Methods to call Apex from Flows:

```apex
public class AccountProcessor {
    
    @InvocableMethod(
        label='Process Accounts' 
        description='Complex processing called from Flow'
    )
    public static List<Result> processAccounts(List<Request> requests) {
        List<Result> results = new List<Result>();
        
        for (Request req : requests) {
            Result res = new Result();
            res.success = true;
            res.message = 'Processed: ' + req.accountId;
            results.add(res);
        }
        
        return results;
    }
    
    public class Request {
        @InvocableVariable(required=true)
        public Id accountId;
        
        @InvocableVariable
        public String action;
    }
    
    public class Result {
        @InvocableVariable
        public Boolean success;
        
        @InvocableVariable
        public String message;
    }
}
```

## Best Practices

1. **Don't duplicate logic** - If using both, clearly separate concerns
2. **Document the choice** - Explain why trigger vs flow was selected
3. **Consider maintenance** - Who will maintain this long-term?
4. **Test both paths** - Ensure they don't conflict
5. **Use Invocable Methods** - Bridge between Flow and complex Apex
