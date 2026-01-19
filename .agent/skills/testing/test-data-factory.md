---
description: Test data factory patterns for Apex unit tests
---

# Test Data Factory Patterns

Create consistent, maintainable test data for Apex tests.

## Basic Factory Pattern

```apex
@IsTest
public class TestDataFactory {
    
    public static Account createAccount() {
        return createAccount('Test Account');
    }
    
    public static Account createAccount(String name) {
        Account acc = new Account(
            Name = name,
            Industry = 'Technology',
            BillingCity = 'San Francisco',
            BillingState = 'CA'
        );
        return acc;
    }
    
    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(createAccount('Test Account ' + i));
        }
        return accounts;
    }
    
    public static Account createAccountWithContacts(Integer contactCount) {
        Account acc = createAccount();
        insert acc;
        
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < contactCount; i++) {
            contacts.add(new Contact(
                FirstName = 'Test',
                LastName = 'Contact ' + i,
                AccountId = acc.Id,
                Email = 'test' + i + '@example.com'
            ));
        }
        insert contacts;
        
        return acc;
    }
}
```

## Builder Pattern

For complex objects with many optional fields:

```apex
@IsTest
public class OpportunityBuilder {
    
    private Opportunity opp;
    
    public OpportunityBuilder() {
        opp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 10000
        );
    }
    
    public OpportunityBuilder withAccount(Id accountId) {
        opp.AccountId = accountId;
        return this;
    }
    
    public OpportunityBuilder withName(String name) {
        opp.Name = name;
        return this;
    }
    
    public OpportunityBuilder withStage(String stage) {
        opp.StageName = stage;
        return this;
    }
    
    public OpportunityBuilder withAmount(Decimal amount) {
        opp.Amount = amount;
        return this;
    }
    
    public OpportunityBuilder closedWon() {
        opp.StageName = 'Closed Won';
        opp.CloseDate = Date.today();
        return this;
    }
    
    public Opportunity build() {
        return opp;
    }
    
    public Opportunity buildAndInsert() {
        insert opp;
        return opp;
    }
}

// Usage
@IsTest
static void testClosedWonOpportunity() {
    Account acc = TestDataFactory.createAccount();
    insert acc;
    
    Opportunity opp = new OpportunityBuilder()
        .withAccount(acc.Id)
        .withAmount(50000)
        .closedWon()
        .buildAndInsert();
    
    // Test assertions...
}
```

## Using @TestSetup

```apex
@IsTest
private class AccountServiceTest {
    
    @TestSetup
    static void setup() {
        // Runs once before all tests in class
        Account acc = TestDataFactory.createAccountWithContacts(5);
    }
    
    @IsTest
    static void testGetContacts() {
        // Query data created in TestSetup
        Account acc = [SELECT Id FROM Account LIMIT 1];
        
        Test.startTest();
        List<Contact> contacts = AccountService.getContacts(acc.Id);
        Test.stopTest();
        
        System.assertEquals(5, contacts.size());
    }
    
    @IsTest
    static void testUpdateAccount() {
        Account acc = [SELECT Id, Name FROM Account LIMIT 1];
        
        Test.startTest();
        AccountService.updateName(acc.Id, 'New Name');
        Test.stopTest();
        
        acc = [SELECT Name FROM Account WHERE Id = :acc.Id];
        System.assertEquals('New Name', acc.Name);
    }
}
```

## Mock External Dependencies

```apex
@IsTest
public class ExternalServiceMock implements HttpCalloutMock {
    
    private Integer statusCode;
    private String body;
    
    public ExternalServiceMock(Integer statusCode, String body) {
        this.statusCode = statusCode;
        this.body = body;
    }
    
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(statusCode);
        res.setBody(body);
        return res;
    }
    
    // Factory methods for common scenarios
    public static ExternalServiceMock success(String responseBody) {
        return new ExternalServiceMock(200, responseBody);
    }
    
    public static ExternalServiceMock error() {
        return new ExternalServiceMock(500, '{"error":"Server Error"}');
    }
}

// Usage
@IsTest
static void testCallout() {
    Test.setMock(HttpCalloutMock.class, ExternalServiceMock.success('{"status":"ok"}'));
    
    Test.startTest();
    String result = MyService.callExternalApi();
    Test.stopTest();
    
    System.assertEquals('ok', result);
}
```

## Best Practices

1. **Use factory methods** - Not inline test data creation
2. **Minimal required fields** - Only set what's needed
3. **Avoid hardcoded IDs** - Query or create dynamically
4. **Use @TestSetup** - For data used across multiple tests
5. **Builder pattern** - For complex object creation
