const express = require('express');
const router = express.Router();
const schedulerService = require('../services/schedulerService');
const { Log } = require('logging-middleware');

// GET /api/vehicles/schedule
router.get('/schedule', async (req, res) => {
    Log("backend", "info", "route", "Received request for vehicle schedule.");
    try {
        const schedule = await schedulerService.getSchedule();
        res.json(schedule);
    } catch (error) {
        Log("backend", "error", "route", "Error handling /schedule request.");
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
