---
description: Flow design patterns for maintainable automation
---

# Flow Design Patterns

Build scalable and maintainable Flows with these patterns.

## Entry Conditions Best Practices

```
// Record-Triggered Flow Entry Conditions
// Only run when specific conditions are met

Entry Condition Examples:
- Status__c EQUALS 'Submitted' (only process submitted records)
- Amount > 10000 (only high-value opportunities)
- ISCHANGED({!$Record.Status__c}) (only when field changed)
```

## Subflow Pattern

Break large flows into reusable subflows:

```
Main Flow
├── Get Related Data (Subflow)
├── Validate Business Rules (Subflow)
├── Process Records (Subflow)
└── Send Notifications (Subflow)
```

Benefits:
- **Reusability** - Call same logic from multiple flows
- **Maintainability** - Edit in one place
- **Testability** - Test subflows independently
- **Clarity** - Main flow shows high-level process

## Input/Output Variables

Design subflows with clear contracts:

```
Subflow: Calculate_Discount
├── Input Variables
│   ├── {!inputAccountId} (Id, Required)
│   ├── {!inputAmount} (Currency, Required)
│   └── {!inputTier} (Text, Optional)
└── Output Variables
    ├── {!outputDiscountPercent} (Number)
    └── {!outputFinalAmount} (Currency)
```

## Error Handling Pattern

```
Flow Structure:
1. Try Block (Fault Path configured)
   └── DML/Callout Operations
2. Fault Path
   ├── Create Error Log Record
   ├── Send Admin Notification
   └── Display Error to User (if Screen Flow)
```

## Collection Processing

```apex
// Loop through collection efficiently
Loop Variable: {!currentRecord}
Collection: {!recordCollection}

Inside Loop:
├── Add to Update Collection (Assignment)
└── [Don't do DML here!]

After Loop:
└── Update Records (single DML for all)
```

## Decision Matrix Pattern

For complex branching logic:

```
Decision: Determine Process Path
├── Outcome 1: High Priority
│   Condition: Priority__c = 'High' AND Amount > 50000
│   → High Priority Path
├── Outcome 2: Escalation Needed
│   Condition: Age > 30 AND Status = 'Pending'
│   → Escalation Path
└── Default Outcome
    → Standard Processing Path
```

## Best Practices

1. **Limit Loops** - Process records in batches when possible
2. **Bulkify DML** - Collect records, update once after loop
3. **Use Decision Elements** - Instead of complex formula conditions
4. **Name Elements Clearly** - Descriptive names for maintainability
5. **Document with Descriptions** - Add notes to complex elements
6. **Avoid Hardcoded IDs** - Use Custom Metadata or Custom Labels
7. **Test with Multiple Records** - Flows can be triggered in bulk
