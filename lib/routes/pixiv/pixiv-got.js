import tls from 'tls';
import ipRegex from 'ip-regex';
import got from '~/utils/got.js';
import logger from '~/utils/logger';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const pixivConfig = require('~/config').value.pixiv;

async function dohResolve(name, jsonDohEndpoint) {
    try {
        const response = await got.get(jsonDohEndpoint, {
            searchParams: {
                name,
                type: 'A',
            },
            headers: {
                accept: 'application/dns-json',
            },
        });
        if (response.data.Status !== 0) {
            logger.error(`Error ${response.data.Status} when querying DoH endpoint ${jsonDohEndpoint}`);
        } else {
            return response.data.Answer.map((item) => item.data);
        }
    } catch (e) {
        logger.error(`Failed to resolve ${name}`);
        logger.debug(e);
    }
    return [];
}

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
                    const addresses = await dohResolve(pixivConfig.bypassCdnHostname, pixivConfig.bypassCdnDoh);
                    if (addresses.length) {
                        hostname = addresses[Math.floor(addresses.length * Math.random())];
                    } else {
                        logger.warn(`No IPv4 address resolved from ${pixivConfig.bypassCdnHostname}`);
                    }
                }
                if (hostname) {
                    const actualHost = options.url.host;
                    options.headers = {
                        ...options.headers,
                        host: actualHost,
                    };
                    options.url.hostname = hostname;
                    options.checkServerIdentity = (host, certificate) => tls.checkServerIdentity(actualHost, certificate);
                }
            },
        ],
    },
});

export default pixivGot;
