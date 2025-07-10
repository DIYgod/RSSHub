import { config } from '@/config';
import { PacProxyAgent } from 'pac-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyAgent } from 'undici';
import logger from '@/utils/logger';

const proxyIsPAC = config.pacUri || config.pacScript;

import pacProxy from './pac-proxy';
import unifyProxy from './unify-proxy';
import createMultiProxy, { type MultiProxyResult, type ProxyState } from './multi-proxy';

interface ProxyExport {
    agent: PacProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | null;
    dispatcher: ProxyAgent | null;
    proxyUri?: string;
    proxyObj: Record<string, any>;
    proxyUrlHandler?: URL | null;
    multiProxy?: MultiProxyResult;
    getCurrentProxy: () => ProxyState | null;
    markProxyFailed: (proxyUri: string) => void;
    getAgentForProxy: (proxyState: ProxyState) => any;
    getDispatcherForProxy: (proxyState: ProxyState) => ProxyAgent | null;
}

let proxyUri: string | undefined;
let proxyObj: Record<string, any> = {};
let proxyUrlHandler: URL | null = null;
let multiProxy: MultiProxyResult | undefined;

const createAgentForProxy = (uri: string, proxyObj: Record<string, any>): any => {
    if (uri.startsWith('http')) {
        return new HttpsProxyAgent(uri, {
            headers: {
                'proxy-authorization': proxyObj?.auth ? `Basic ${proxyObj.auth}` : undefined,
            },
        });
    } else if (uri.startsWith('socks')) {
        return new SocksProxyAgent(uri);
    }
    return null;
};

const createDispatcherForProxy = (uri: string, proxyObj: Record<string, any>): ProxyAgent | null => {
    if (uri.startsWith('http')) {
        return new ProxyAgent({
            uri,
            token: proxyObj?.auth ? `Basic ${proxyObj.auth}` : undefined,
            requestTls: {
                rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
            },
        });
    }
    return null;
};

if (proxyIsPAC) {
    const proxy = pacProxy(config.pacUri, config.pacScript, config.proxy);
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
} else if (config.proxyUris && config.proxyUris.length > 0) {
    multiProxy = createMultiProxy(config.proxyUris, config.proxy);
    proxyObj = multiProxy.proxyObj;
    const currentProxy = multiProxy.getNextProxy();
    if (currentProxy) {
        proxyUri = currentProxy.uri;
        proxyUrlHandler = currentProxy.urlHandler;
    }
    logger.info(`Multi-proxy initialized with ${config.proxyUris.length} proxies`);
} else {
    const proxy = unifyProxy(config.proxyUri, config.proxy);
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
}

let agent: PacProxyAgent<string> | HttpsProxyAgent<string> | SocksProxyAgent | null = null;
let dispatcher: ProxyAgent | null = null;

if (proxyIsPAC && proxyUri) {
    agent = new PacProxyAgent(`pac+${proxyUri}`);
} else if (proxyUri) {
    agent = createAgentForProxy(proxyUri, proxyObj);
    dispatcher = createDispatcherForProxy(proxyUri, proxyObj);
}

const getCurrentProxy = (): ProxyState | null => {
    if (multiProxy) {
        return multiProxy.getNextProxy();
    }
    if (proxyUri) {
        return {
            uri: proxyUri,
            isActive: true,
            failureCount: 0,
            urlHandler: proxyUrlHandler,
        };
    }
    return null;
};

const markProxyFailed = (failedProxyUri: string) => {
    if (multiProxy) {
        multiProxy.markProxyFailed(failedProxyUri);
        const nextProxy = multiProxy.getNextProxy();
        if (nextProxy) {
            proxyUri = nextProxy.uri;
            proxyUrlHandler = nextProxy.urlHandler || null;
            agent = createAgentForProxy(nextProxy.uri, proxyObj);
            dispatcher = createDispatcherForProxy(nextProxy.uri, proxyObj);
            logger.info(`Switched to proxy: ${nextProxy.uri}`);
        } else {
            logger.warn('No available proxies remaining');
            agent = null;
            dispatcher = null;
            proxyUri = undefined;
        }
    }
};

const getAgentForProxy = (proxyState: ProxyState) => createAgentForProxy(proxyState.uri, proxyObj);

const getDispatcherForProxy = (proxyState: ProxyState) => createDispatcherForProxy(proxyState.uri, proxyObj);

const proxyExport: ProxyExport = {
    agent,
    dispatcher,
    proxyUri,
    proxyObj,
    proxyUrlHandler,
    multiProxy,
    getCurrentProxy,
    markProxyFailed,
    getAgentForProxy,
    getDispatcherForProxy,
};

export default proxyExport;
