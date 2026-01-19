---
description: Step-by-step workflows for REST API callouts and external integrations
---

# Integrations Workflow

## Prerequisites
- Named Credential or Remote Site Setting configured
- Understanding of HTTP methods and JSON

---

## Workflow: Make a REST Callout

### Step 1: Create Named Credential (Recommended)
Setup → Named Credentials → New:
- **Label**: My External API
- **URL**: https://api.example.com
- **Identity Type**: Named Principal
- **Authentication**: OAuth 2.0 or Password

### Step 2: Create the Callout Class
```apex
public class ExternalApiService {
    
    private static final String NAMED_CREDENTIAL = 'callout:My_External_API';
    
    public static String getResource(String resourceId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + '/resources/' + resourceId);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new CalloutException('Error: ' + res.getStatusCode());
        }
    }
    
    public static String createResource(Map<String, Object> data) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + '/resources');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(data));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 201) {
            return res.getBody();
        } else {
            throw new CalloutException('Error: ' + res.getStatusCode());
        }
    }
}
```

### Step 3: Parse JSON Response
```apex
public class ResourceWrapper {
    public String id;
    public String name;
    public String status;
}

// Parse single object
ResourceWrapper resource = (ResourceWrapper) JSON.deserialize(
    jsonString, 
    ResourceWrapper.class
);

// Parse array
List<ResourceWrapper> resources = (List<ResourceWrapper>) JSON.deserialize(
    jsonString,
    List<ResourceWrapper>.class
);
```

---

## Workflow: Call Apex from External System

### Step 1: Create REST Resource
```apex
@RestResource(urlMapping='/accounts/*')
global with sharing class AccountRestService {
    
    @HttpGet
    global static Account getAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        return [SELECT Id, Name, Industry FROM Account WHERE Id = :accountId];
    }
    
    @HttpPost
    global static Id createAccount(String name, String industry) {
        Account acc = new Account(Name = name, Industry = industry);
        insert acc;
        return acc.Id;
    }
}
```

### Step 2: Configure Connected App
Setup → App Manager → New Connected App:
- Enable OAuth Settings
- Add scopes: `api`, `refresh_token`
- Get Consumer Key and Secret

---

## Workflow: Use Platform Events

### Step 1: Create Platform Event
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Order Event</label>
    <pluralLabel>Order Events</pluralLabel>
    <publishBehavior>PublishImmediately</publishBehavior>
</CustomObject>
```

### Step 2: Publish Event
```apex
Order_Event__e event = new Order_Event__e(
    Order_Id__c = orderId,
    Status__c = 'Completed'
);
EventBus.publish(event);
```

### Step 3: Subscribe (Trigger)
```apex
trigger OrderEventTrigger on Order_Event__e (after insert) {
    for (Order_Event__e event : Trigger.new) {
        // Process event
    }
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **Callout from trigger** | Use @future(callout=true) or Queueable |
| **Unauthorized endpoint** | Add to Remote Site Settings |
| **SSL errors** | Ensure certificate chain is valid |

---

## Related Skills
- [rest-api.md](../skills/integrations/rest-api.md)
