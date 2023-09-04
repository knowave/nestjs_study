/**
 * @description pm2 configuration file.
 */
module.exports = {
    apps: [
        {
            name: "chopsticks-gcp-cron-job",        // pm2 start App name
            script: "dist/main.js",
            exec_mode: "cluster",                   // "cluster" or "fork"
            instance_var: "INSTANCE_ID",            // Instance Variable
            instances: "max",                       // pm2 instance count
            autorestart: true,                      // Auto restart if process crash
            watch: false,                           // files change automatic restart
            ignore_watch: ["node_modules", "logs"], // Ignore files change
            max_memory_restart: "1G",               // restart if process use more than 1G memory
            merge_logs: true,                       // if true, stdout and stderr will be merged and sent to pm2 log
            output: "./logs/access.log",            // pm2 log file
            error: "./logs/error.log",              // pm2 error log file
            env: {
                PORT: 8080
            },
        }
    ]
}