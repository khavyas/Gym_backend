module.exports = {
    apps: [
        {
            name: "backend",
            script: "dist/main.js",
            instances: 1,
            autorestart: true,
            max_memory_restart: "300M",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};