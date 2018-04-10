const logger = require('./logger');
const redis = require('redis');
let client;
if (process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT) {
    client = redis.createClient({
        host: process.env.REDIS_PORT_6379_TCP_ADDR,
        port: process.env.REDIS_PORT_6379_TCP_PORT
    });
}
else {
    client = redis.createClient();
}

client.on('error', (err) => {
    logger.error('Redis Error ' + err);
});

module.exports = {
    set: (key, value, time = 5 * 60) => {
        client.set(key, value, 'EX', time);
        logger.info('Redis Set: ' + key);
    },
    get: (key, callback) => {
        client.get(key, (err, reply) => {
            callback(reply);
        });
    },
    client: client
};