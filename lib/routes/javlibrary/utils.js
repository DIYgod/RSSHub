const cloudscraper = require('cloudscraper').defaults({
    agentOptions: {
        ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256',
    },
});
const logger = require('@/utils/logger');

module.exports = async function getResponse(link) {
    return await cloudscraper.get(link).then((body) => body, logger.error);
};
