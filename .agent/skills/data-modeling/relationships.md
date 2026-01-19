---
description: Object relationship patterns for data modeling
---

# Object Relationship Patterns

Design scalable object relationships in Salesforce.

## Relationship Types

| Type | Cardinality | Cascade Delete | Roll-up Summary |
|------|-------------|----------------|-----------------|
| Lookup | 1:N, Optional | No | No (without code) |
| Master-Detail | 1:N, Required | Yes | Yes |
| Many-to-Many | N:N | Via Junction | Via Junction |
| External Lookup | 1:N External | No | No |
| Hierarchical | Self 1:N | No | No |

## Master-Detail Relationship

Use when child cannot exist without parent:

```
Account (Master)
└── Opportunity (Detail)
    - OWD inherited from Account
    - Deleted when Account deleted
    - Roll-up summaries available
```

Best for:
- Order → Order Items
- Invoice → Invoice Lines
- Project → Tasks

## Lookup Relationship

Use when relationship is optional:

```
Contact
└── Account (Lookup - Optional)
    - Contact can exist without Account
    - Separate OWD settings
    - No cascade delete
```

Best for:
- Optional associations
- Cross-object references
- Self-referential (Hierarchies)

## Junction Object Pattern

Many-to-Many relationships require a junction object:

```
Opportunity ──┬── OpportunityContactRole ──┬── Contact
              │   (Junction Object)        │
              │   - OpportunityId (M-D)   │
              │   - ContactId (M-D)       │
              │   - Role (Picklist)       │
              │   - IsPrimary (Checkbox)  │
              └───────────────────────────┘
```

```apex
// Create junction record
OpportunityContactRole ocr = new OpportunityContactRole();
ocr.OpportunityId = oppId;
ocr.ContactId = contactId;
ocr.Role = 'Decision Maker';
ocr.IsPrimary = true;
insert ocr;

// Query through junction
List<Contact> oppContacts = [
    SELECT Contact.Name, Contact.Email, Role
    FROM OpportunityContactRole
    WHERE OpportunityId = :oppId
];
```

## Hierarchical Relationships

Self-referencing for organizational structures:

```
Account
└── ParentId (Self-Lookup)
    ├── Ultimate Parent
    │   └── Subsidiary 1
    │       └── Regional Office
    └── Subsidiary 2
```

```apex
// Query hierarchy (up to 5 levels)
Account acc = [
    SELECT Name, 
           Parent.Name,
           Parent.Parent.Name,
           Parent.Parent.Parent.Name
    FROM Account 
    WHERE Id = :accountId
];

// Query children
List<Account> subsidiaries = [
    SELECT Id, Name 
    FROM Account 
    WHERE ParentId = :parentAccountId
];
```

## Schema Design Best Practices

1. **Start with Master-Detail** - Change to Lookup if needed later
2. **Limit relationship depth** - Max 5 levels for queries
3. **Consider query patterns** - Design for common access patterns
4. **Use External IDs** - For integration relationships
5. **Document relationships** - ERD diagrams essential

## Relationship Limits

| Limit | Value |
|-------|-------|
| Lookups per object | 40 |
| Master-Detail per object | 2 |
| Junction object M-D | 2 |
| Query relationship depth | 5 levels up, 1 level down |
