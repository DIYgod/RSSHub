import { describe, expect, it } from 'vitest';

import pacProxy from '@/utils/proxy/pac-proxy';

const emptyProxyObj = {
    protocol: undefined,
    host: undefined,
    port: undefined,
    auth: undefined,
    url_regex: '.*',
};

const effectiveExpect = ({ proxyUri, proxyObj }, expectUri, expectObj) => {
    expect(proxyUri).toBe(expectUri);
    expect(proxyObj).toEqual(expectObj);
};

describe('pac-proxy', () => {
    const nullExpect = (pac) => effectiveExpect(pac, undefined, emptyProxyObj);
    it('pac empty', () => {
        nullExpect(pacProxy('', '', emptyProxyObj));
    });
    it('pac-uri invalid', () => {
        nullExpect(pacProxy('http://inv ild.test', '', emptyProxyObj));
    });
    it('pac-uri invalid protocol', () => {
        nullExpect(pacProxy('socks://rsshub.proxy', '', emptyProxyObj));
    });

    const httpUri = 'http://rsshub.proxy/pac.pac';
    it('pac-uri http', () => {
        effectiveExpect(pacProxy(httpUri, '', emptyProxyObj), httpUri, emptyProxyObj);
    });

    const httpsUri = 'https://rsshub.proxy/pac.pac';
    it('pac-uri https', () => {
        effectiveExpect(pacProxy(httpsUri, '', emptyProxyObj), httpsUri, emptyProxyObj);
    });

    const ftpUri = 'ftp://rsshub.proxy:2333';
    it('pac-uri ftp', () => {
        effectiveExpect(pacProxy(ftpUri, '', emptyProxyObj), ftpUri, emptyProxyObj);
    });

    const fileUri = 'file:///path/to/pac.pac';
    it('pac-uri file', () => {
        effectiveExpect(pacProxy(fileUri, '', emptyProxyObj), fileUri, emptyProxyObj);
    });

    const dataPacScript = "function FindProxyForURL(url, host){return 'DIRECT';}";
    const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(dataPacScript);
    it('pac-script data', () => {
        effectiveExpect(pacProxy('', dataPacScript, emptyProxyObj), dataUri, emptyProxyObj);
    });

    const httpsObj = { ...emptyProxyObj, protocol: 'https', host: 'rsshub.proxy', port: '2333' };
    const httpsAuthUri = 'https://user:pass@rsshub.proxy:2333';
    it('pac-uri https auth', () => {
        effectiveExpect(pacProxy(httpsAuthUri, '', emptyProxyObj), httpsAuthUri, httpsObj);
    });

    const httpsAuthObj = { ...httpsObj, auth: 'testtest' };
    it('pac proxy-obj https auth', () => {
        effectiveExpect(pacProxy(httpsUri, '', httpsAuthObj), httpsUri, httpsAuthObj);
    });

    const ftpObj = { ...httpsObj, protocol: 'ftp' };
    const ftpAuthUri = 'ftp://user:pass@rsshub.proxy:2333';
    it('pac-uri ftp auth', () => {
        effectiveExpect(pacProxy(ftpAuthUri, '', emptyProxyObj), ftpAuthUri, ftpObj);
    });

    const ftpAuthObj = { ...ftpObj, auth: 'testtest' };
    it('pac-uri ftp auth (invalid)', () => {
        effectiveExpect(pacProxy(ftpUri, '', ftpAuthObj), ftpUri, ftpObj);
    });

    it('pac-uri user@pass override proxy-obj auth', () => {
        effectiveExpect(pacProxy(httpsAuthUri, '', httpsAuthObj), httpsAuthUri, httpsObj);
    });
});
