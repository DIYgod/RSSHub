const dnsPromises = require('dns').promises;
const ipRegex = require('ip-regex');
const got = require('@/utils/got');
const logger = require('@/utils/logger');
const pixivConfig = require('@/config').value.pixiv;

const pixivGot = got.extend({
    hooks: {
        beforeRequest: [
            async (options) => {
                if (!pixivConfig.bypassCdn) {
                    return;
                }
                let hostname = null;
                const isIP = ipRegex({ exact: true }).test(pixivConfig.bypassCdnHostname);
                if (isIP) {
                    hostname = pixivConfig.bypassCdnHostname;
                } else {
                    try {
                        const addresses = await dnsPromises.resolve4(pixivConfig.bypassCdnHostname);
                        if (addresses.length) {
                            hostname = addresses[Math.floor(addresses.length * Math.random())];
                        } else {
                            logger.warn(`No IPv4 address resolved from ${pixivConfig.bypassCdnHostname}`);
                        }
                    } catch (e) {
                        logger.error(`Failed to resolve ${pixivConfig.bypassCdnHostname}`);
                    }
                }
                if (hostname) {
                    options.headers = {
                        ...options.headers,
                        host: options.url.hostname,
                    };
                    options.url.hostname = hostname;
                }
            },
        ],
    },
});

module.exports = pixivGot;
