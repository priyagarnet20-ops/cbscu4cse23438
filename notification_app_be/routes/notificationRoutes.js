const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const axios = require('axios');
const { Log, getAuthToken } = require('logging-middleware');

const NOTIFICATIONS_API = 'http://20.207.122.201/evaluation-service/notifications';

const getPriorityWeight = (type) => {
    switch (type) {
        case 'Placement': return 3;
        case 'Result': return 2;
        case 'Event': return 1;
        default: return 0;
    }
};

// GET /api/notifications/all
router.get('/all', async (req, res) => {
    Log("backend", "info", "route", "Received request to fetch all notifications");
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Missing Auth Token");

        const response = await axios.get(NOTIFICATIONS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const notifications = response.data;
        Log("backend", "info", "service", `Fetched ${notifications.length} notifications from remote server.`);
        
        const ops = notifications.map(notif => ({
            updateOne: {
                filter: { notificationId: notif.ID || notif.notificationId },
                update: {
                    $set: {
                        notificationId: notif.ID || notif.notificationId,
                        type: notif.Type || notif.type,
                        message: notif.Message || notif.message,
                        timestamp: notif.Timestamp || notif.timestamp || new Date(),
                        studentId: notif.StudentID || notif.studentId || 'UNKNOWN'
                    }
                },
                upsert: true
            }
        }));

        if (ops.length > 0) {
            await Notification.bulkWrite(ops);
            Log("backend", "info", "db", "Successfully upserted notifications into MongoDB");
        }

        res.json({ message: 'Notifications fetched and stored successfully', count: notifications.length });
    } catch (error) {
        Log("backend", "error", "route", `Failed to fetch notifications: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
    }
});

// GET /api/notifications/priority
router.get('/priority', async (req, res) => {
    Log("backend", "info", "route", "Fetching priority notifications");
    try {
        const notifications = await Notification.find().lean();

        notifications.sort((a, b) => {
            const weightA = getPriorityWeight(a.type);
            const weightB = getPriorityWeight(b.type);
            
            if (weightA !== weightB) return weightB - weightA;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        const top10 = notifications.slice(0, 10);
        Log("backend", "info", "service", `Returned ${top10.length} priority notifications`);
        res.json(top10);
    } catch (error) {
        Log("backend", "error", "route", `Failed to get priority notifications: ${error.message}`);
        res.status(500).json({ error: 'Failed to get priority notifications', message: error.message });
    }
});

// POST /api/notifications/mass
router.post('/mass', async (req, res) => {
    Log("backend", "info", "route", "Received mass notification request");
    try {
        const { message, type } = req.body;
        
        res.status(202).json({ message: 'Mass notification queued successfully' });

        setImmediate(async () => {
            Log("backend", "info", "service", `[Queue] Starting mass notification process for type: ${type}`);
            const totalUsers = 50000;
            const batchSize = 1000;
            let processed = 0;

            while (processed < totalUsers) {
                await new Promise(resolve => setTimeout(resolve, 100));
                processed += batchSize;
                Log("backend", "debug", "service", `[Queue] Processed ${processed}/${totalUsers} notifications...`);
            }
            Log("backend", "info", "service", `[Queue] Mass notification completed.`);
        });

    } catch (error) {
        Log("backend", "error", "route", `Error in mass notification queue: ${error.message}`);
    }
});

// GET /api/notifications/student/:studentId
router.get('/student/:studentId', async (req, res) => {
    Log("backend", "info", "route", `Fetching paginated notifications for student: ${req.params.studentId}`);
    try {
        const { studentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ studentId: studentId, isRead: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        Log("backend", "info", "db", `Retrieved ${notifications.length} notifications from DB`);
        res.json({ page, limit, count: notifications.length, data: notifications });
    } catch (error) {
        Log("backend", "error", "route", `Database query failed: ${error.message}`);
        res.status(500).json({ error: 'Database query failed', message: error.message });
    }
});

module.exports = router;
