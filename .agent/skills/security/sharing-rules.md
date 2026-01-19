---
description: Sharing rules and manual sharing in Apex
---

# Sharing Rules and Manual Sharing

Control record-level access programmatically.

## Sharing Hierarchy

```
1. Organization-Wide Defaults (OWD)
   └── Most restrictive baseline
2. Role Hierarchy
   └── Managers see subordinate records
3. Sharing Rules
   └── Criteria or owner-based sharing
4. Manual Sharing
   └── Individual record sharing
5. Apex Managed Sharing
   └── Programmatic sharing
```

## Apex Managed Sharing

```apex
public class OpportunitySharing {
    
    public static void shareWithTeam(Id opportunityId, Set<Id> userIds) {
        List<OpportunityShare> shares = new List<OpportunityShare>();
        
        for (Id userId : userIds) {
            OpportunityShare share = new OpportunityShare();
            share.OpportunityId = opportunityId;
            share.UserOrGroupId = userId;
            share.OpportunityAccessLevel = 'Edit';  // 'Read' or 'Edit'
            share.RowCause = Schema.OpportunityShare.RowCause.Manual;
            shares.add(share);
        }
        
        // Insert with partial success
        Database.SaveResult[] results = Database.insert(shares, false);
        
        for (Integer i = 0; i < results.size(); i++) {
            if (!results[i].isSuccess()) {
                System.debug('Share failed: ' + results[i].getErrors());
            }
        }
    }
    
    public static void removeSharing(Id opportunityId, Set<Id> userIds) {
        List<OpportunityShare> sharesToDelete = [
            SELECT Id 
            FROM OpportunityShare 
            WHERE OpportunityId = :opportunityId 
            AND UserOrGroupId IN :userIds
            AND RowCause = :Schema.OpportunityShare.RowCause.Manual
        ];
        
        delete sharesToDelete;
    }
}
```

## Custom Object Sharing

For custom objects, use `__Share` suffix:

```apex
public class CustomObjectSharing {
    
    public static void shareRecord(Id recordId, Id userId, String accessLevel) {
        Project__Share share = new Project__Share();
        share.ParentId = recordId;           // Use ParentId for custom objects
        share.UserOrGroupId = userId;
        share.AccessLevel = accessLevel;     // 'Read' or 'Edit'
        share.RowCause = Schema.Project__Share.RowCause.Manual;
        
        insert share;
    }
}
```

## Apex Sharing Reason (Custom RowCause)

Define custom sharing reasons in object settings:

```apex
// Using custom sharing reason
public static void shareWithPartner(Id recordId, Id partnerId) {
    Project__Share share = new Project__Share();
    share.ParentId = recordId;
    share.UserOrGroupId = partnerId;
    share.AccessLevel = 'Edit';
    share.RowCause = 'Partner_Access__c';  // Custom sharing reason
    
    insert share;
}

// Query by sharing reason
List<Project__Share> partnerShares = [
    SELECT Id, ParentId, UserOrGroupId 
    FROM Project__Share 
    WHERE RowCause = 'Partner_Access__c'
];
```

## Check User Access

```apex
public class AccessChecker {
    
    public static Boolean hasEditAccess(Id recordId, Id userId) {
        // Use UserRecordAccess for checking access
        UserRecordAccess access = [
            SELECT HasEditAccess, HasReadAccess, HasDeleteAccess
            FROM UserRecordAccess
            WHERE RecordId = :recordId AND UserId = :userId
        ];
        
        return access.HasEditAccess;
    }
    
    public static Map<Id, Boolean> checkBulkAccess(Set<Id> recordIds) {
        Map<Id, Boolean> accessMap = new Map<Id, Boolean>();
        
        for (UserRecordAccess ura : [
            SELECT RecordId, HasEditAccess
            FROM UserRecordAccess
            WHERE RecordId IN :recordIds AND UserId = :UserInfo.getUserId()
        ]) {
            accessMap.put(ura.RecordId, ura.HasEditAccess);
        }
        
        return accessMap;
    }
}
```

## Best Practices

1. **Use groups instead of users** - Easier to maintain
2. **Clean up orphaned shares** - When records/users deleted
3. **Use custom sharing reasons** - For easier management
4. **Check access before sharing** - Avoid duplicate shares
5. **Consider Apex sharing for complex rules** - Beyond declarative capability
