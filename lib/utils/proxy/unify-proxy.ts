import type { Config } from '@/config';
import logger from '@/utils/logger';

const defaultProtocol = 'http';
const possibleProtocol = ['http', 'https', 'socks', 'socks4', 'socks4a', 'socks5', 'socks5h'];

const unifyProxy = (proxyUri: Config['proxyUri'] | string, proxyObj: Config['proxy']) => {
    proxyObj = proxyObj || {};
    const [oriProxyUri, oriProxyObj] = [proxyUri, proxyObj];
    proxyObj = { ...proxyObj };

    let proxyUrlHandler: URL | null = null;

    // PROXY_URI
    if (proxyUri && typeof proxyUri === 'string') {
        if (!proxyUri.includes('://')) {
            logger.warn(`PROXY_URI contains no protocol, assuming ${defaultProtocol}`);
            proxyUri = `${defaultProtocol}://${proxyUri}`;
        }
        try {
            proxyUrlHandler = new URL(proxyUri);
        } catch (error: any) {
            logger.error(`Parse PROXY_URI error: ${error.stack}`);
        }
    }

    // PROXY_{PROTOCOL,HOST,PORT}
    if (proxyObj.protocol || proxyObj.host || proxyObj.port) {
        if (proxyUrlHandler) {
            logger.warn('PROXY_URI is set, ignoring PROXY_{PROTOCOL,HOST,PORT}');
        } else if (proxyObj.host) {
            let tempProxyStr = proxyObj.host;

            if (tempProxyStr.includes('://')) {
                logger.warn('PROXY_HOST contains protocol, ignoring PROXY_PROTOCOL');
            } else if (proxyObj.protocol) {
                tempProxyStr = `${proxyObj.protocol}://${tempProxyStr}`;
            } else {
                logger.warn(`PROXY_PROTOCOL is not set, assuming '${defaultProtocol}'`);
                tempProxyStr = `${defaultProtocol}://${tempProxyStr}`;
            }
            try {
                proxyUrlHandler = new URL(tempProxyStr);
                if (proxyUrlHandler.port && proxyObj.port) {
                    logger.warn('PROXY_HOST contains port, ignoring PROXY_PORT');
                } else if (proxyObj.port) {
                    if (Number.parseInt(proxyObj.port)) {
                        proxyUrlHandler.port = proxyObj.port;
                    } else {
                        logger.warn(`PROXY_PORT is not a number, ignoring`);
                    }
                } else {
                    logger.warn('PROXY_PORT is not set, leaving proxy agent to determine');
                }
            } catch (error: any) {
                logger.error(`Parse PROXY_HOST error: ${error.stack}`);
            }
        } else {
            logger.warn('Either PROXY_{PROTOCOL,PORT} is set, but PROXY_HOST is missing, ignoring');
        }
    }

    // PROXY_AUTH
    if (proxyObj.auth && proxyUrlHandler) {
        let promptProxyUri = false;
        if (proxyUrlHandler.username || proxyUrlHandler.password) {
            logger.warn('PROXY_URI contains username and/or password, ignoring PROXY_AUTH');
            proxyObj.auth = undefined;
        } else if (['http:', 'https:'].includes(proxyUrlHandler.protocol)) {
            logger.info('PROXY_AUTH is set and will be used for requests from Node.js. However, requests from puppeteer will not use it');
            promptProxyUri = true;
        } else {
            logger.warn(`PROXY_AUTH is only supported by HTTP(S) proxies, but got ${proxyUrlHandler.protocol}, ignoring`);
            proxyObj.auth = undefined;
            promptProxyUri = true;
        }
        if (promptProxyUri) {
            logger.info('To get rid of this, set PROXY_URI like protocol://username:password@host:port and clear PROXY_{AUTH,PROTOCOL,HOST,PORT}');
        }
    }

    // is proxy enabled and valid?
    let isProxyValid = false;
    if (proxyUrlHandler) {
        const protocol = proxyUrlHandler.protocol.replace(':', '');
        if (possibleProtocol.includes(protocol)) {
            if (protocol !== 'http' && (proxyUrlHandler.username || proxyUrlHandler.password)) {
                logger.warn("PROXY_URI is an HTTPS/SOCKS proxy with authentication, which is not supported by puppeteer (ignore if you don't need it)");
                logger.info('To get rid of this, consider using an HTTP proxy instead');
            }
            proxyObj.protocol = protocol;
            proxyObj.host = proxyUrlHandler.hostname;
            proxyObj.port = proxyUrlHandler.port || undefined;
            // trailing slash will cause puppeteer to throw net::ERR_NO_SUPPORTED_PROXIES, trim it
            proxyUri = proxyUrlHandler.href.endsWith('/') ? proxyUrlHandler.href.slice(0, -1) : proxyUrlHandler.href;
            isProxyValid = true;
        } else {
            logger.error(`Unsupported proxy protocol: ${protocol}, expect one of ${possibleProtocol.join(', ')}`);
        }
    }
    if (!isProxyValid) {
        if ((oriProxyUri && typeof oriProxyUri === 'string') || oriProxyObj.protocol || oriProxyObj.host || oriProxyObj.port || oriProxyObj.auth) {
            logger.error('Proxy is disabled due to misconfiguration');
        }
        proxyObj.protocol = proxyObj.host = proxyObj.port = proxyObj.auth = undefined;
        proxyUri = undefined;
        proxyUrlHandler = null;
    }

    return { proxyUri, proxyObj, proxyUrlHandler };
};

export const unifyProxies = (proxyUris: string[], proxyObj: Config['proxy']) => proxyUris.map((uri) => unifyProxy(uri, proxyObj)).filter((result) => result.proxyUri);

export default unifyProxy;
