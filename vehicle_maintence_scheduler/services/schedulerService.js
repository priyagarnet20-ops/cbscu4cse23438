const axios = require('axios');
const { knapsack } = require('../utils/knapsack');
const { Log, getAuthToken } = require('logging-middleware');

const DEPOTS_API = 'http://20.207.122.201/evaluation-service/depots';
const VEHICLES_API = 'http://20.207.122.201/evaluation-service/vehicles';

async function getSchedule() {
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error("Missing Auth Token for protected route");
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        Log("backend", "info", "service", "Fetching depots and vehicles from test server.");
        
        const [depotsRes, vehiclesRes] = await Promise.all([
            axios.get(DEPOTS_API, { headers }),
            axios.get(VEHICLES_API, { headers })
        ]);

        const depots = depotsRes.data.depots || depotsRes.data;
        const vehicles = vehiclesRes.data.vehicles || vehiclesRes.data;
        console.log("DEBUG DEPOTS:", JSON.stringify(depots).substring(0, 200));
        console.log("DEBUG VEHICLES:", JSON.stringify(vehicles).substring(0, 200));

        Log("backend", "info", "service", `Successfully fetched ${depots.length} depots and ${vehicles.length} vehicles.`);

        const schedule = [];

        for (const depot of depots) {
            const capacity = Math.floor(depot.mechanicHours || depot.MechanicHours);
            const tasks = vehicles.map(v => ({
                taskId: v.TaskID || v.taskId,
                duration: Math.ceil(v.Duration || v.duration),
                impact: v.Impact || v.impact
            }));

            const result = knapsack(capacity, tasks);
            
            schedule.push({
                depotId: depot.ID || depot.depotId,
                selectedTasks: result.selectedTasks,
                totalDuration: result.totalDuration,
                totalImpact: result.totalImpact
            });
        }

        Log("backend", "info", "service", "Knapsack schedule calculated.");
        return schedule;
    } catch (error) {
        console.error("DEBUG ERROR:", error?.response?.data || error);
        Log("backend", "error", "service", `Failed to gen schedule`);
        throw new Error('Failed to generate schedule');
    }
}

module.exports = { getSchedule };
