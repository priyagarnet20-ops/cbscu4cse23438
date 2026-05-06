require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const vehicleRoutes = require('./routes/vehicleRoutes');
const { Log } = require('logging-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/vehicles', vehicleRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Vehicle Maintenance Scheduler API' });
});

app.use((err, req, res, next) => {
    Log("backend", "error", "route", `Unhandled Error: ${err.message}`);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus-microservice')
    .then(() => {
        Log("backend", "info", "db", "Connected to MongoDB successfully");
        app.listen(PORT, () => {
            Log("backend", "info", "route", `Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        Log("backend", "fatal", "db", `Critical database connection failure: ${err.message}`);
        process.exit(1);
    });
