module.exports = {
    apps: [
        {
            name: process.env.APP_NAME || 'CMS EXPRESS JS',
            script: './bin/www',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
            env_development: {
                NODE_ENV: 'development',
            },
        },
    ],
}