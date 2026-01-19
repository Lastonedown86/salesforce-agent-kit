---
description: REST API patterns for Salesforce integrations
---

# REST API Patterns

Integrate with Salesforce using REST API.

## Apex REST Web Service

```apex
@RestResource(urlMapping='/accounts/*')
global with sharing class AccountRestService {
    
    @HttpGet
    global static Account getAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(
            req.requestURI.lastIndexOf('/') + 1
        );
        
        return [
            SELECT Id, Name, Industry, Phone 
            FROM Account 
            WHERE Id = :accountId
        ];
    }
    
    @HttpPost
    global static Id createAccount(String name, String industry) {
        Account acc = new Account(
            Name = name,
            Industry = industry
        );
        insert acc;
        return acc.Id;
    }
    
    @HttpPut
    global static Account updateAccount(
        String id, String name, String industry
    ) {
        Account acc = [SELECT Id FROM Account WHERE Id = :id];
        acc.Name = name;
        acc.Industry = industry;
        update acc;
        return acc;
    }
    
    @HttpDelete
    global static void deleteAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(
            req.requestURI.lastIndexOf('/') + 1
        );
        
        Account acc = [SELECT Id FROM Account WHERE Id = :accountId];
        delete acc;
    }
}
```

## HTTP Callouts from Apex

```apex
public class ExternalApiService {
    
    private static final String ENDPOINT = 'callout:External_System';
    
    public static String getData(String resourceId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(ENDPOINT + '/api/resource/' + resourceId);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(30000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new CalloutException(
                'API Error: ' + res.getStatusCode() + ' - ' + res.getBody()
            );
        }
    }
    
    public static String postData(Map<String, Object> payload) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(ENDPOINT + '/api/resource');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(payload));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
            return res.getBody();
        } else {
            throw new CalloutException('API Error: ' + res.getStatusCode());
        }
    }
}
```

## Named Credentials

Configure in Setup > Named Credentials:

```apex
// Using named credential (recommended)
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:My_External_System/api/accounts');
req.setMethod('GET');
// Auth headers added automatically

// Benefits:
// - Credentials stored securely
// - No hardcoded secrets
// - Easy to change endpoints
// - Supports OAuth, Password, JWT
```

## Response Parsing

```apex
public class ApiResponseParser {
    
    public class AccountResponse {
        public String id;
        public String name;
        public String status;
        public List<ContactData> contacts;
    }
    
    public class ContactData {
        public String email;
        public String phone;
    }
    
    public static AccountResponse parseResponse(String jsonBody) {
        return (AccountResponse) JSON.deserialize(
            jsonBody, 
            AccountResponse.class
        );
    }
    
    // For dynamic parsing
    public static Map<String, Object> parseToMap(String jsonBody) {
        return (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
    }
}
```

## Async Callouts

```apex
// Future method for callouts
@future(callout=true)
public static void syncExternalData(Set<Id> accountIds) {
    for (Id accId : accountIds) {
        // Make callout
        String response = ExternalApiService.getData(accId);
        // Process response
    }
}

// Queueable for chained callouts
public class ApiSyncQueueable implements Queueable, Database.AllowsCallouts {
    private List<Id> recordIds;
    
    public ApiSyncQueueable(List<Id> recordIds) {
        this.recordIds = recordIds;
    }
    
    public void execute(QueueableContext context) {
        // Process batch of callouts
        // Chain to next queueable if needed
    }
}
```

## Best Practices

1. **Use Named Credentials** - Never hardcode credentials
2. **Set timeouts** - Prevent long-running callouts
3. **Handle errors** - Check status codes, catch exceptions
4. **Use async for trigger callouts** - Can't do callouts in triggers directly
5. **Mock in tests** - Use HttpCalloutMock interface
