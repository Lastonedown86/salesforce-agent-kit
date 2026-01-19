---
description: Queueable Apex patterns for flexible async processing
---

# Queueable Apex Patterns

Queueable Apex provides a flexible way to run asynchronous jobs with support for chaining and complex data types.

## Basic Queueable Implementation

```apex
public class MyQueueable implements Queueable {
    
    private List<Id> recordIds;
    
    public MyQueueable(List<Id> recordIds) {
        this.recordIds = recordIds;
    }
    
    public void execute(QueueableContext context) {
        List<Account> accounts = [
            SELECT Id, Name 
            FROM Account 
            WHERE Id IN :recordIds
        ];
        
        for (Account acc : accounts) {
            acc.Description = 'Processed by Queueable';
        }
        
        update accounts;
    }
}
```

## Queueable with Callouts

```apex
public class CalloutQueueable implements Queueable, Database.AllowsCallouts {
    
    private String endpoint;
    
    public CalloutQueueable(String endpoint) {
        this.endpoint = endpoint;
    }
    
    public void execute(QueueableContext context) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Process response
    }
}
```

## Chaining Queueables

```apex
public void execute(QueueableContext context) {
    // Do work...
    
    // Chain to next job (max depth: 5 in synchronous, unlimited in async)
    if (!Test.isRunningTest()) {
        System.enqueueJob(new NextQueueable());
    }
}
```

## Best Practices

1. **Use for complex object types** - Unlike future methods, Queueables support non-primitive types
2. **Chain carefully** - Max 5 chained jobs from synchronous context
3. **Track job chains** with AsyncApexJob queries
4. **Test with Test.isRunningTest()** to prevent chaining in tests
5. **Use for callouts** when you need to pass complex data

## Invoking Queueable

```apex
Id jobId = System.enqueueJob(new MyQueueable(accountIds));
```

## Queueable vs Future vs Batch

| Feature | Queueable | Future | Batch |
|---------|-----------|--------|-------|
| Complex types | ✓ | ✗ | ✓ |
| Chaining | ✓ | ✗ | ✓ |
| Job ID | ✓ | ✗ | ✓ |
| Large data | ✗ | ✗ | ✓ |
| Callouts | ✓ | ✓ | ✓ |
