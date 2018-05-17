const cluster = require('cluster');
const config = require('./config');
const logger = require('./utils/logger');

const memoryCacheMaster = require('./utils/memorycache');

new memoryCacheMaster({
    expire: config.cacheExpire * 1000,
});

for (let i = 0; i < config.clusterSizes; i++) {
    cluster.setupMaster({
        exec: 'service.js',
    });
    cluster.fork();
}

cluster.on('exit', (worker) => {
    logger.warn(`worker ${worker.process.pid} died`);
    cluster.setupMaster({
        exec: 'service.js',
    });
    cluster.fork();
});
