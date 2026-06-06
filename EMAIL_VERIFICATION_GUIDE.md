# 📋 Email & Notification Verification Guide

## Quick Verification Endpoints

### **1. Debug Dashboard Endpoint** ⭐ (NEW)

Get a complete status of notification delivery:

```bash
curl -X GET http://localhost:6060/api/debug/notification-status \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response includes:**
- ✅ Overdue prospects in database (count + details)
- ✅ Total users in system
- ✅ Notifications sent today
- ✅ Unread notifications
- ✅ Last 7 days summary

### **2. Send Test Email** ⭐ (NEW)

Send a test email to your admin account:

```bash
curl -X POST http://localhost:6060/api/debug/test-email \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response:**
- Shows if email sent successfully
- Lists prospect(s) included in test
- Logs test email in database

---

## Verification Checklist

### **Step 1: Verify Database Setup**

```sql
-- Check if NotificationLog table exists
SELECT * FROM NotificationLog LIMIT 1;

-- Should return no error if table exists
```

### **Step 2: Create Test Overdue Prospect**

First, check if you have overdue prospects:

```sql
-- Find overdue prospects
SELECT 
  id,
  name,
  school,
  stage,
  nextFollowUpDate,
  DATEDIFF(CURDATE(), DATE(nextFollowUpDate)) as days_overdue
FROM Prospect
WHERE deletedAt IS NULL
  AND stage != 'Pilot Closed'
  AND nextFollowUpDate < CURDATE()
ORDER BY nextFollowUpDate ASC;
```

If none exist, create a test prospect:

```sql
INSERT INTO Prospect (
  id,
  name,
  school,
  stage,
  email,
  nextFollowUpDate,
  createdAt,
  updatedAt
) VALUES (
  CUID(), -- Generate a unique ID
  'Test School',
  'Test School',
  'Cold',
  'test@example.com',
  DATE_SUB(CURDATE(), INTERVAL 5 DAY), -- 5 days overdue
  NOW(),
  NOW()
);
```

### **Step 3: Configure Email (Development)**

Set in your `.env`:
```bash
NODE_ENV=development
ENABLE_NOTIFICATIONS=true
```

In development mode, emails print to console instead of sending.

### **Step 4: Trigger Manual Check**

```bash
# Manual trigger (admin only)
curl -X POST http://localhost:6060/api/notifications/trigger-check \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Look for response:
# {
#   "success": true,
#   "overdueProspectsFound": 5,
#   "emailsSent": 3,
#   "emailsFailed": 0,
#   "usersNotified": 3
# }
```

### **Step 5: Check Backend Console**

Watch for these logs:

```
[Scheduler] Manual trigger of overdue prospect check
[Notification Service] Starting overdue prospect check...
[Notification Service] Found 5 overdue prospect(s)
[Email Service] Email sent to user@example.com: Success
[Notification Service] Notification cycle complete. Sent: 3, Failed: 0
```

### **Step 6: Query Notification Logs**

```sql
-- Check notifications were created
SELECT 
  nl.id,
  u.email,
  nl.type,
  nl.title,
  nl.read,
  nl.createdAt
FROM NotificationLog nl
JOIN User u ON nl.userId = u.id
WHERE nl.type = 'overdue_prospects'
ORDER BY nl.createdAt DESC
LIMIT 10;
```

### **Step 7: Check Frontend Notifications**

**Frontend API endpoint:**
```bash
curl -X GET http://localhost:6060/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "userId": "clx...",
      "type": "overdue_prospects",
      "title": "5 Overdue Follow-ups",
      "message": "You have 5 prospect(s) with overdue follow-up dates.",
      "read": false,
      "createdAt": "2026-06-06T14:30:00Z"
    }
  ],
  "unreadCount": 1
}
```

**In Browser:**
- Look for 🔔 bell icon in top-right of dashboard
- Should show red badge with unread count
- Click to see dropdown notification list

---

## Comprehensive Verification Queries

### **Check Email Delivery Status**

```sql
-- Summary of all notification deliveries
SELECT 
  DATE(nl.createdAt) as date,
  u.name as user,
  u.email,
  COUNT(*) as notifications_sent,
  SUM(CASE WHEN nl.read = 0 THEN 1 ELSE 0 END) as unread,
  GROUP_CONCAT(DISTINCT JSON_EXTRACT(nl.metadata, '$.prospectCount')) as prospect_counts
FROM NotificationLog nl
JOIN User u ON nl.userId = u.id
WHERE nl.type = 'overdue_prospects'
GROUP BY DATE(nl.createdAt), u.id, u.name, u.email
ORDER BY nl.createdAt DESC;

-- Find users who never received notifications
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(nl.id) as notification_count
FROM User u
LEFT JOIN NotificationLog nl ON u.id = nl.userId 
  AND nl.type = 'overdue_prospects'
GROUP BY u.id, u.name, u.email
HAVING notification_count = 0;

-- Prospects included in last notification batch
SELECT 
  nl.id as notification_id,
  u.email as recipient,
  nl.metadata->'$.prospectCount' as prospect_count,
  nl.metadata->'$.prospectIds' as prospect_ids,
  nl.createdAt
FROM NotificationLog nl
JOIN User u ON nl.userId = u.id
WHERE nl.type = 'overdue_prospects'
  AND nl.createdAt >= NOW() - INTERVAL 24 HOUR
ORDER BY nl.createdAt DESC;
```

### **Email Success/Failure Analysis**

```sql
-- Group notifications by read status
SELECT 
  nl.type,
  nl.read,
  COUNT(*) as count,
  MIN(nl.createdAt) as first_sent,
  MAX(nl.createdAt) as last_sent
FROM NotificationLog nl
WHERE nl.type = 'overdue_prospects'
GROUP BY nl.type, nl.read;

-- Find unread notifications (users who haven't seen alerts)
SELECT 
  u.name,
  u.email,
  COUNT(nl.id) as unread_notifications,
  MIN(nl.createdAt) as oldest_unread,
  GROUP_CONCAT(nl.title SEPARATOR ', ') as titles
FROM NotificationLog nl
JOIN User u ON nl.userId = u.id
WHERE nl.type = 'overdue_prospects'
  AND nl.read = FALSE
GROUP BY u.id, u.name, u.email
ORDER BY COUNT(nl.id) DESC;
```

---

## Troubleshooting

### **Problem: No Notifications Created**

**Check:**
1. Are there overdue prospects in database?
   ```sql
   SELECT COUNT(*) FROM Prospect 
   WHERE nextFollowUpDate < CURDATE() 
   AND stage != 'Pilot Closed'
   AND deletedAt IS NULL;
   ```

2. Is the scheduler enabled?
   ```bash
   # Check logs for:
   # [Scheduler] Initializing notification scheduler...
   ```

3. Is `ENABLE_NOTIFICATIONS` not set to `false`?
   ```bash
   echo $ENABLE_NOTIFICATIONS  # Should be true or empty
   ```

### **Problem: Emails Not Sending**

**Check:**
1. Email configuration:
   ```bash
   echo $GMAIL_USER
   echo $GMAIL_PASS
   # OR
   echo $SMTP_HOST
   ```

2. Development vs Production mode:
   ```bash
   echo $NODE_ENV
   # If "development", emails go to console
   # If "production", emails actually send via SMTP/Gmail
   ```

3. Test with debug endpoint:
   ```bash
   curl -X POST http://localhost:6060/api/debug/test-email \
     -H "Authorization: Bearer YOUR_ADMIN_JWT"
   ```

### **Problem: Frontend Bell Not Showing Notifications**

**Check:**
1. Network tab - API call to `/api/notifications` returns data
2. Console for errors in `useNotifications` hook
3. Database has entries in `NotificationLog` table
4. User is authenticated (JWT token valid)

---

## Real-Time Monitoring

### **Watch Scheduler Run**

```bash
# Terminal 1: Start backend with logs visible
cd Backend && npm run dev

# Terminal 2: At 9 AM (or trigger manually), watch for:
# [Scheduler] Executing overdue prospect check at ...
# [Notification Service] Found X overdue prospect(s)
# [Email Service] Email sent to ...
```

### **Monitor Email Delivery Log**

```bash
# In database, run this repeatedly to see updates:
SELECT 
  nl.id,
  u.email,
  nl.title,
  nl.createdAt,
  nl.read
FROM NotificationLog nl
JOIN User u ON nl.userId = u.id
ORDER BY nl.createdAt DESC
LIMIT 20;
```

---

## Sample Response Examples

### **Successful Manual Trigger**
```json
{
  "success": true,
  "overdueProspectsFound": 3,
  "emailsSent": 5,
  "emailsFailed": 0,
  "usersNotified": 5
}
```

### **Debug Status Endpoint Response**
```json
{
  "success": true,
  "data": {
    "overdueProspects": {
      "count": 3,
      "prospects": [
        {
          "id": "clx1...",
          "name": "School A",
          "school": "School A",
          "stage": "Contacted",
          "nextFollowUpDate": "2026-06-01T00:00:00.000Z"
        }
      ]
    },
    "notificationDelivery": {
      "sentToday": {
        "count": 5,
        "notifications": [
          {
            "id": "clx...",
            "userId": "clx...",
            "user": { "id": "clx...", "name": "Admin", "email": "admin@example.com" },
            "type": "overdue_prospects",
            "title": "3 Overdue Follow-ups",
            "read": false,
            "createdAt": "2026-06-06T09:00:00.000Z"
          }
        ]
      },
      "unreadTotal": {
        "count": 5,
        "notifications": [...]
      }
    },
    "verification": {
      "overdue_prospects_in_db": 3,
      "total_users_in_system": 5,
      "notifications_sent_today": 5,
      "expected_emails": 5,
      "unread_notifications": 5
    }
  }
}
```

---

## Key Metrics to Track

| Metric | Where to Check | Expected Value |
|--------|-----------------|-----------------|
| Overdue prospects detected | Debug endpoint / Database query | > 0 if any are overdue |
| Emails sent | Manual trigger response | = Number of users |
| Notifications logged | NotificationLog table | = Users × 1 per trigger |
| Email failures | Backend logs / API response | 0 (ideally) |
| Unread count | `/api/notifications` | > 0 when new |
| Read notifications | `/api/notifications` | Decreases as users view |

---

## Next Steps After Verification

1. **Set production email** - Update `.env` with real SMTP/Gmail credentials
2. **Test with Gmail app password** - Follow Google's app-specific password setup
3. **Schedule daily run** - Leave `NOTIFICATION_SCHEDULE=0 9 * * *` or customize
4. **Monitor logs** - Set up centralized logging (e.g., Sentry)
5. **Track metrics** - Create dashboard showing notification delivery trends

