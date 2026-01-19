---
description: Step-by-step workflows for implementing Salesforce security and sharing
---

# Security & Sharing Workflow

## Prerequisites
- System Administrator access
- Understanding of profiles and permission sets

---

## Workflow: Implement CRUD/FLS Checks in Apex

### Step 1: Check Object-Level Permissions
```apex
// Check if user can create Accounts
if (!Schema.sObjectType.Account.isCreateable()) {
    throw new AuraHandledException('Insufficient access to create Account');
}

// Check if user can read, update, delete
Schema.DescribeSObjectResult accountDesc = Account.sObjectType.getDescribe();
Boolean canRead = accountDesc.isAccessible();
Boolean canUpdate = accountDesc.isUpdateable();
Boolean canDelete = accountDesc.isDeletable();
```

### Step 2: Check Field-Level Permissions
```apex
// Check single field
if (!Schema.sObjectType.Account.fields.AnnualRevenue.isAccessible()) {
    throw new AuraHandledException('Cannot access Annual Revenue field');
}

// Check multiple fields
Map<String, Schema.SObjectField> fieldMap = Schema.sObjectType.Account.fields.getMap();
List<String> fieldsToCheck = new List<String>{'Name', 'Industry', 'AnnualRevenue'};

for (String fieldName : fieldsToCheck) {
    Schema.SObjectField field = fieldMap.get(fieldName);
    if (field != null && !field.getDescribe().isAccessible()) {
        throw new AuraHandledException('Cannot access field: ' + fieldName);
    }
}
```

### Step 3: Use WITH SECURITY_ENFORCED
```apex
// Automatically enforces FLS - throws exception if no access
List<Account> accounts = [
    SELECT Id, Name, AnnualRevenue 
    FROM Account 
    WITH SECURITY_ENFORCED
];
```

### Step 4: Use Security.stripInaccessible()
```apex
// Remove inaccessible fields instead of throwing exception
List<Account> accounts = [SELECT Id, Name, AnnualRevenue FROM Account];
SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.READABLE, 
    accounts
);
List<Account> sanitizedAccounts = decision.getRecords();

// Check which fields were removed
Set<String> removedFields = decision.getRemovedFields().get('Account');
```

---

## Workflow: Configure Sharing Rules

### Step 1: Understand OWD
Check Organization-Wide Defaults:
- **Private**: Only owner and above can access
- **Public Read Only**: All users can view
- **Public Read/Write**: All users can view and edit

### Step 2: Create Sharing Rule (Metadata)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<SharingRules xmlns="http://soap.sforce.com/2006/04/metadata">
    <sharingCriteriaRules>
        <fullName>Share_Active_Accounts</fullName>
        <accessLevel>Read</accessLevel>
        <booleanFilter></booleanFilter>
        <criteriaItems>
            <field>Status__c</field>
            <operation>equals</operation>
            <value>Active</value>
        </criteriaItems>
        <sharedTo>
            <group>AllInternalUsers</group>
        </sharedTo>
    </sharingCriteriaRules>
</SharingRules>
```

### Step 3: Create Apex Sharing (Programmatic)
```apex
// Share an Account with a specific user
AccountShare accShare = new AccountShare();
accShare.AccountId = accountId;
accShare.UserOrGroupId = userId;
accShare.AccountAccessLevel = 'Edit';
accShare.OpportunityAccessLevel = 'Read';
accShare.RowCause = Schema.AccountShare.RowCause.Manual;

insert accShare;
```

---

## Workflow: Create Permission Set

### Step 1: Create Permission Set (Metadata)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Project Manager</label>
    <description>Access for project managers</description>
    <hasActivationRequired>false</hasActivationRequired>
    <objectPermissions>
        <allowCreate>true</allowCreate>
        <allowDelete>false</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <object>Project__c</object>
    </objectPermissions>
    <fieldPermissions>
        <editable>true</editable>
        <field>Project__c.Budget__c</field>
        <readable>true</readable>
    </fieldPermissions>
</PermissionSet>
```

### Step 2: Assign Permission Set
```apex
// Apex assignment
PermissionSetAssignment psa = new PermissionSetAssignment(
    AssigneeId = userId,
    PermissionSetId = permSetId
);
insert psa;
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **Insufficient privileges** | Check profile + permission sets |
| **Cannot see records** | Check sharing rules & role hierarchy |
| **FLS bypass in tests** | Use System.runAs() with proper user |

---

## Related Skills
- [crud-fls.md](../skills/security/crud-fls.md)
- [sharing-rules.md](../skills/security/sharing-rules.md)
