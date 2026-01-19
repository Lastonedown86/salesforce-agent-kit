---
description: Step-by-step workflows for Flow Builder and process automation
---

# Flows & Automation Workflow

## Prerequisites
- Flow Builder access
- Understanding of Flow types and when to use each

---

## Workflow: Create Record-Triggered Flow

### Step 1: Determine Trigger Conditions
- **Object**: Which object triggers the flow?
- **Trigger**: When (Create, Update, Delete)?
- **Entry Conditions**: Filter criteria
- **Timing**: Before or After save?

### Step 2: Create the Flow
1. Setup → Flows → New Flow
2. Select **Record-Triggered Flow**
3. Configure:
   - Object: Account
   - Trigger: A record is created or updated
   - Entry Conditions: Status equals "New"
   - Optimize for: Actions and Related Records (After)

### Step 3: Add Flow Elements

**Get Related Records**
```
Get Records: Contacts
Filter: AccountId = {!$Record.Id}
Store: {!ContactCollection}
```

**Loop Through Records**
```
Loop: For each contact in {!ContactCollection}
  Assignment: Set contact fields
```

**Update Records**
```
Update Records: {!ContactCollection}
```

### Step 4: Handle Errors
Add Fault Path:
- Create custom error notification
- Log to custom object for monitoring

---

## Workflow: Create Screen Flow

### Step 1: Plan the User Journey
1. Input screen(s) - collect information
2. Processing - create/update records
3. Confirmation - display results

### Step 2: Build Input Screen
```
Screen: "Enter Account Details"
Components:
  - Text Input: Account Name (required)
  - Picklist: Industry
  - Text Area: Description
```

### Step 3: Add Decision Logic
```
Decision: Check Existing Account
  Outcome 1: Account Exists
    Condition: {!ExistingAccount} Is Null = False
  Default: New Account
```

### Step 4: Create Records
```
Create Records: Account
  Name = {!AccountName}
  Industry = {!Industry}
Store ID: {!NewAccountId}
```

### Step 5: Add Confirmation Screen
```
Screen: "Success"
Components:
  - Display Text: "Account created: {!NewAccountId}"
  - Navigation: Back to record
```

---

## Workflow: Debug a Flow

### Step 1: Enable Flow Debug Logs
1. Open the Flow in Flow Builder
2. Click **Debug**
3. Select record or enter test values
4. Run and review each step

### Step 2: Add Fault Handling
For each element that can fail:
1. Connect a Fault path
2. Create error log record or send notification

### Step 3: Common Debug Points
- Check variable values at each step
- Verify Get Records returns expected data
- Confirm formulas evaluate correctly

---

## Flow Best Practices

| Practice | Why |
|----------|-----|
| **Use Before-Save when possible** | No DML, faster execution |
| **Bulkify Get Records** | Use IN operator with collections |
| **One flow per object trigger** | Easier to maintain order |
| **Use Subflows** | Reusable logic, cleaner design |

---

## Related Skills
- [flow-design-patterns.md](../skills/flows/flow-design-patterns.md)
- [record-triggered-flows.md](../skills/flows/record-triggered-flows.md)
