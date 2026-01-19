---
description: Step-by-step workflows for Salesforce data modeling and object relationships
---

# Data Modeling Workflow

## Prerequisites
- Salesforce org with customization permissions
- Understanding of Salesforce object model

---

## Workflow: Create a Custom Object

### Step 1: Plan the Object
Define requirements:
- **Object Label**: Human-readable name (e.g., "Project")
- **Object API Name**: ProjectName__c
- **Record Name Field**: Auto Number or Text
- **Relationships**: Parent objects, child objects

### Step 2: Create via Metadata (Recommended)
Create `Project__c.object-meta.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Project</label>
    <pluralLabel>Projects</pluralLabel>
    <nameField>
        <label>Project Number</label>
        <type>AutoNumber</type>
        <displayFormat>PRJ-{0000}</displayFormat>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
</CustomObject>
```

### Step 3: Add Custom Fields
Create `Status__c.field-meta.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Status__c</fullName>
    <label>Status</label>
    <type>Picklist</type>
    <valueSet>
        <restricted>true</restricted>
        <valueSetDefinition>
            <sorted>false</sorted>
            <value><fullName>New</fullName><default>true</default></value>
            <value><fullName>In Progress</fullName><default>false</default></value>
            <value><fullName>Completed</fullName><default>false</default></value>
        </valueSetDefinition>
    </valueSet>
</CustomField>
```

---

## Workflow: Create Object Relationships

### Lookup Relationship
```xml
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Account__c</fullName>
    <label>Account</label>
    <type>Lookup</type>
    <referenceTo>Account</referenceTo>
    <relationshipLabel>Projects</relationshipLabel>
    <relationshipName>Projects</relationshipName>
</CustomField>
```

### Master-Detail Relationship
```xml
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Project__c</fullName>
    <label>Project</label>
    <type>MasterDetail</type>
    <referenceTo>Project__c</referenceTo>
    <relationshipLabel>Tasks</relationshipLabel>
    <relationshipName>Tasks</relationshipName>
    <reparentableMasterDetail>false</reparentableMasterDetail>
    <writeRequiresMasterRead>false</writeRequiresMasterRead>
</CustomField>
```

### Junction Object (Many-to-Many)
1. Create junction object (e.g., `ProjectMember__c`)
2. Add two master-detail fields to parent objects
3. Query using either parent relationship

---

## Workflow: Design Schema for New Feature

### Step 1: Identify Entities
List all business objects and their relationships:
```
Account (1) ──── (M) Project ──── (M) Task
                       │
                       └── (M) ProjectMember ──── (1) User
```

### Step 2: Determine Relationship Types
| Relationship | Type | Reason |
|--------------|------|--------|
| Account → Project | Lookup | Projects can exist without Account |
| Project → Task | Master-Detail | Tasks require parent Project |
| Project ↔ User | Junction | Many-to-many via ProjectMember |

### Step 3: Plan Roll-up Summaries
```xml
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>TaskCount__c</fullName>
    <label>Task Count</label>
    <type>Summary</type>
    <summarizedField>Task__c.Id</summarizedField>
    <summaryOperation>count</summaryOperation>
</CustomField>
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **Can't delete object** | Delete child relationships first |
| **Roll-up not available** | Requires Master-Detail, not Lookup |
| **Hit relationship limit** | Max 2 Master-Detail per object |

---

## Related Skills
- [data-relationships.md](../skills/data-modeling/data-relationships.md)
