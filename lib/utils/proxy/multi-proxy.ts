import type { Config } from '@/config';
import logger from '@/utils/logger';

import unifyProxy from './unify-proxy';

export interface ProxyState {
    uri: string;
    isActive: boolean;
    failureCount: number;
    lastFailureTime?: number;
    agent?: any;
    dispatcher?: any;
    urlHandler?: URL | null;
}

export interface MultiProxyResult {
    currentProxy?: ProxyState | null;
    allProxies: ProxyState[];
    proxyObj: Config['proxy'];
    getNextProxy: () => ProxyState | null;
    markProxyFailed: (proxyUri: string) => void;
    resetProxy: (proxyUri: string) => void;
}

const createMultiProxy = (proxyUris: string[], proxyObj: Config['proxy']): MultiProxyResult => {
    const proxies: ProxyState[] = [];
    let currentProxyIndex = 0;

    for (const uri of proxyUris) {
        const unifiedProxy = unifyProxy(uri, proxyObj);
        if (unifiedProxy.proxyUri) {
            proxies.push({
                uri: unifiedProxy.proxyUri,
                isActive: true,
                failureCount: 0,
                urlHandler: unifiedProxy.proxyUrlHandler,
            });
        }
    }

    if (proxies.length === 0) {
        logger.warn('No valid proxies found in the provided list');
        return {
            allProxies: [],
            proxyObj: proxyObj || {},
            getNextProxy: () => null,
            markProxyFailed: () => {},
            resetProxy: () => {},
        };
    }

    const healthCheckInterval = proxyObj?.healthCheckInterval || 60000;
    const maxFailures = 3;

    const healthCheck = () => {
        const now = Date.now();
        for (const proxy of proxies) {
            if (!proxy.isActive && proxy.lastFailureTime && now - proxy.lastFailureTime > healthCheckInterval) {
                proxy.isActive = true;
                proxy.failureCount = 0;
                delete proxy.lastFailureTime;
                logger.info(`Proxy ${proxy.uri} marked as active again after health check`);
            }
        }
    };

    setInterval(healthCheck, healthCheckInterval);

    const getNextProxy = (): ProxyState | null => {
        const activeProxies = proxies.filter((p) => p.isActive);
        if (activeProxies.length === 0) {
            logger.warn('No active proxies available');
            return null;
        }

        let nextProxy = activeProxies[currentProxyIndex % activeProxies.length];
        let attempts = 0;

        while (!nextProxy.isActive && attempts < activeProxies.length) {
            currentProxyIndex = (currentProxyIndex + 1) % activeProxies.length;
            nextProxy = activeProxies[currentProxyIndex];
            attempts++;
        }

        if (!nextProxy.isActive) {
            return null;
        }

        return nextProxy;
    };

    const markProxyFailed = (proxyUri: string) => {
        const proxy = proxies.find((p) => p.uri === proxyUri);
        if (proxy) {
            proxy.failureCount++;
            proxy.lastFailureTime = Date.now();
            if (proxy.failureCount >= maxFailures) {
                proxy.isActive = false;
                logger.warn(`Proxy ${proxyUri} marked as inactive after ${maxFailures} failures`);
            } else {
                logger.warn(`Proxy ${proxyUri} failed (${proxy.failureCount}/${maxFailures})`);
            }

            const activeProxies = proxies.filter((p) => p.isActive);
            if (activeProxies.length > 0) {
                currentProxyIndex = (currentProxyIndex + 1) % activeProxies.length;
                const nextProxy = getNextProxy();
                if (nextProxy) {
                    logger.info(`Switching to proxy: ${nextProxy.uri}`);
                }
            }
        }
    };

    const resetProxy = (proxyUri: string) => {
        const proxy = proxies.find((p) => p.uri === proxyUri);
        if (proxy) {
            proxy.isActive = true;
            proxy.failureCount = 0;
            delete proxy.lastFailureTime;
            logger.info(`Proxy ${proxyUri} manually reset`);
        }
    };

    const currentProxy = getNextProxy();
    if (currentProxy) {
        logger.info(`Initial proxy selected: ${currentProxy.uri}`);
    }

    return {
        currentProxy,
        allProxies: proxies,
        proxyObj: proxyObj || {},
        getNextProxy,
        markProxyFailed,
        resetProxy,
    };
};

export default createMultiProxy;
