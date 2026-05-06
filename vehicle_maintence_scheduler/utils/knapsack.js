/**
 * 0/1 Knapsack implementation using Dynamic Programming
 */
function knapsack(capacity, tasks) {
    const n = tasks.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            const task = tasks[i - 1];
            if (task.duration <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - task.duration] + task.impact
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let res = dp[n][capacity];
    let w = capacity;
    const selectedTasks = [];
    let totalDuration = 0;

    for (let i = n; i > 0 && res > 0; i--) {
        if (res === dp[i - 1][w]) {
            continue;
        } else {
            const task = tasks[i - 1];
            selectedTasks.push(task.taskId);
            res = res - task.impact;
            w = w - task.duration;
            totalDuration += task.duration;
        }
    }

    return {
        selectedTasks: selectedTasks.reverse(),
        totalDuration,
        totalImpact: dp[n][capacity]
    };
}

module.exports = { knapsack };
