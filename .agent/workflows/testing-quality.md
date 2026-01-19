---
description: Step-by-step workflows for Apex testing and code quality
---

# Testing & Quality Workflow

## Prerequisites
- Understanding of Apex test framework
- Test data isolation requirements

---

## Workflow: Create a Test Data Factory

### Step 1: Create the Factory Class
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
            BillingCity = 'San Francisco'
        );
        insert acc;
        return acc;
    }
    
    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                Industry = 'Technology'
            ));
        }
        insert accounts;
        return accounts;
    }
    
    public static Contact createContact(Id accountId) {
        Contact con = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Email = 'test@example.com',
            AccountId = accountId
        );
        insert con;
        return con;
    }
    
    public static User createStandardUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        String uniqueKey = String.valueOf(DateTime.now().getTime());
        
        User u = new User(
            Alias = 'tuser',
            Email = 'testuser' + uniqueKey + '@example.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'TestUser',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            Username = 'testuser' + uniqueKey + '@example.com'
        );
        insert u;
        return u;
    }
}
```

---

## Workflow: Write a Comprehensive Test Class

### Step 1: Structure the Test Class
```apex
@IsTest
private class AccountServiceTest {
    
    @TestSetup
    static void setup() {
        // Create common test data
        List<Account> accounts = TestDataFactory.createAccounts(5);
    }
    
    @IsTest
    static void testCreateAccount_Success() {
        // Given
        String accountName = 'New Test Account';
        
        // When
        Test.startTest();
        Account result = AccountService.createAccount(accountName);
        Test.stopTest();
        
        // Then
        System.assertNotEquals(null, result.Id, 'Account should be created');
        System.assertEquals(accountName, result.Name, 'Name should match');
    }
    
    @IsTest
    static void testCreateAccount_DuplicateName() {
        // Given
        Account existing = [SELECT Name FROM Account LIMIT 1];
        
        // When/Then
        Test.startTest();
        try {
            AccountService.createAccount(existing.Name);
            System.assert(false, 'Should have thrown exception');
        } catch (AccountService.DuplicateException e) {
            System.assert(e.getMessage().contains('duplicate'));
        }
        Test.stopTest();
    }
    
    @IsTest
    static void testBulkOperation() {
        // Given
        List<Account> accounts = [SELECT Id FROM Account];
        
        // When
        Test.startTest();
        AccountService.processAccounts(accounts);
        Test.stopTest();
        
        // Then
        List<Account> updated = [SELECT Status__c FROM Account];
        for (Account acc : updated) {
            System.assertEquals('Processed', acc.Status__c);
        }
    }
}
```

---

## Workflow: Test Async Apex

### Testing Batch Apex
```apex
@IsTest
static void testBatchExecution() {
    // Given
    TestDataFactory.createAccounts(200);
    
    // When
    Test.startTest();
    Database.executeBatch(new AccountBatch(), 50);
    Test.stopTest(); // Waits for batch to complete
    
    // Then
    Integer processedCount = [SELECT COUNT() FROM Account WHERE Status__c = 'Processed'];
    System.assertEquals(200, processedCount);
}
```

### Testing Queueable
```apex
@IsTest
static void testQueueableExecution() {
    // Given
    Account acc = TestDataFactory.createAccount();
    
    // When
    Test.startTest();
    System.enqueueJob(new AccountQueueable(acc.Id));
    Test.stopTest();
    
    // Then
    Account updated = [SELECT Status__c FROM Account WHERE Id = :acc.Id];
    System.assertEquals('Updated', updated.Status__c);
}
```

### Testing @future
```apex
@IsTest
static void testFutureMethod() {
    // Given
    Account acc = TestDataFactory.createAccount();
    
    // When
    Test.startTest();
    AccountService.processAccountAsync(acc.Id);
    Test.stopTest();
    
    // Then
    Account updated = [SELECT Status__c FROM Account WHERE Id = :acc.Id];
    System.assertEquals('Processed', updated.Status__c);
}
```

---

## Workflow: Mock External Callouts

### Step 1: Create Mock Class
```apex
@IsTest
global class MockHttpResponse implements HttpCalloutMock {
    
    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"status":"success","id":"12345"}');
        res.setStatusCode(200);
        return res;
    }
}
```

### Step 2: Use in Test
```apex
@IsTest
static void testCallout() {
    // Given
    Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
    
    // When
    Test.startTest();
    String result = ExternalService.makeCallout();
    Test.stopTest();
    
    // Then
    System.assertEquals('12345', result);
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **SeeAllData issues** | Use @TestSetup, avoid SeeAllData=true |
| **Mixed DML in tests** | Use System.runAs() to separate contexts |
| **Async not completing** | Wrap in Test.startTest()/stopTest() |
| **Low coverage** | Test negative cases and edge cases |

---

## Related Skills
- [test-data-factory.md](../skills/testing/test-data-factory.md)
