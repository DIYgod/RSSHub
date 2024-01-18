const config = require('@/config').value;
const logger = require('./logger');

const possibleProtocol = ['http', 'https', 'ftp', 'file', 'data'];

const pacProxy = (pacUri, pacScript, proxyObj) => {
    let pacUrlHandler = null;

    // Validate PAC_URI / PAC_SCRIPT
    if (pacScript) {
        if (typeof pacScript === 'string') {
            pacUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(pacScript);
        } else {
            logger.error('Invalid PAC_SCRIPT, use PAC_URI instead');
        }
    }
    if (pacUri && typeof pacUri === 'string') {
        try {
            pacUrlHandler = new URL(pacUri);
        } catch (error) {
            pacUri = null;
            pacUrlHandler = null;
            logger.error(`Parse PAC_URI error: ${error.stack}`);
        }
    } else {
        pacUri = null;
    }

    // Check if PAC_URI has the right protocol
    if (pacUri && !possibleProtocol.includes(pacUrlHandler?.protocol?.replace(':', ''))) {
        logger.error(`Unsupported PAC protocol: ${pacUrlHandler?.protocol?.replace(':', '')}, expect one of ${possibleProtocol.join(', ')}`);
        pacUri = null;
        pacUrlHandler = null;
    }

    // Validate proxyObj
    if (pacUrlHandler) {
        proxyObj.host = pacUrlHandler.hostname;
        proxyObj.port = Number.parseInt(pacUrlHandler.port) || undefined;
        proxyObj.protocol = pacUrlHandler.protocol.replace(':', '');
    } else {
        proxyObj.protocol = proxyObj.host = proxyObj.port = proxyObj.auth = undefined;
    }

    // Validate PROXY_AUTH
    if (proxyObj.auth && pacUrlHandler) {
        let promptProxyUri = false;
        if (pacUrlHandler.username || pacUrlHandler.password) {
            logger.warn('PAC_URI contains username and/or password, ignoring PROXY_AUTH');
            proxyObj.auth = undefined;
        } else if (['http:', 'https:'].includes(pacUrlHandler.protocol)) {
            logger.info('PROXY_AUTH is set and will be used for requests from Node.js. However, requests from puppeteer will not use it');
            promptProxyUri = true;
        } else {
            logger.warn(`PROXY_AUTH is only supported by HTTP(S) proxies, but got ${pacUrlHandler.protocol}, ignoring`);
            proxyObj.auth = undefined;
            promptProxyUri = true;
        }
        if (promptProxyUri) {
            logger.info('To get rid of this, set PAC_URI like protocol://username:password@host:port and clear PROXY_{AUTH,PROTOCOL,HOST,PORT}');
        }
    }

    // Compatible with unify-proxy
    return {
        proxyUri: pacUri,
        proxyObj,
        proxyUrlHandler: pacUrlHandler,
    };
};

module.exports = {
    pacProxy,
    ...pacProxy(config.pacUri, config.pacScript, config.proxy),
};
