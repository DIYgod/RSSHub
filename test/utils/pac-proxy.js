const { pacProxy } = require('../../lib/utils/pac-proxy');

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
    const nullExpect = (pac) => effectiveExpect(pac, null, emptyProxyObj);
    it('pac empty', () => {
        nullExpect(pacProxy(null, null, emptyProxyObj));
    });
    it('pac-uri invalid', () => {
        nullExpect(pacProxy('http://inv ild.test', null, emptyProxyObj));
    });
    it('pac-uri invalid protocol', () => {
        nullExpect(pacProxy('socks://rsshub.proxy', null, emptyProxyObj));
    });

    const httpUri = 'http://rsshub.proxy/pac.pac';
    it('pac-uri http', () => {
        effectiveExpect(pacProxy(httpUri, null, emptyProxyObj), httpUri, emptyProxyObj);
    });

    const httpsUri = 'https://rsshub.proxy/pac.pac';
    it('pac-uri https', () => {
        effectiveExpect(pacProxy(httpsUri, null, emptyProxyObj), httpsUri, emptyProxyObj);
    });

    const ftpUri = 'ftp://rsshub.proxy:2333';
    it('pac-uri ftp', () => {
        effectiveExpect(pacProxy(ftpUri, null, emptyProxyObj), ftpUri, emptyProxyObj);
    });

    const fileUri = 'file:///path/to/pac.pac';
    it('pac-uri file', () => {
        effectiveExpect(pacProxy(fileUri, null, emptyProxyObj), fileUri, emptyProxyObj);
    });

    const dataPacScript = "function FindProxyForURL(url, host){return 'DIRECT';}";
    const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(dataPacScript);
    it('pac-script data', () => {
        effectiveExpect(pacProxy(null, dataPacScript, emptyProxyObj), dataUri, emptyProxyObj);
    });
    it('pac-script data invalid type', () => {
        effectiveExpect(pacProxy(httpsUri, 1, emptyProxyObj), httpsUri, emptyProxyObj);
    });

    const httpsObj = { ...emptyProxyObj, protocol: 'https', host: 'rsshub.proxy', port: 2333 };
    const httpsAuthUri = 'https://user:pass@rsshub.proxy:2333';
    it('pac-uri https auth', () => {
        effectiveExpect(pacProxy(httpsAuthUri, null, emptyProxyObj), httpsAuthUri, httpsObj);
    });

    const httpsAuthObj = { ...httpsObj, auth: 'testtest' };
    it('pac proxy-obj https auth', () => {
        effectiveExpect(pacProxy(httpsUri, null, httpsAuthObj), httpsUri, httpsAuthObj);
    });

    const ftpObj = { ...httpsObj, protocol: 'ftp' };
    const ftpAuthUri = 'ftp://user:pass@rsshub.proxy:2333';
    it('pac-uri ftp auth', () => {
        effectiveExpect(pacProxy(ftpAuthUri, null, emptyProxyObj), ftpAuthUri, ftpObj);
    });

    const ftpAuthObj = { ...ftpObj, auth: 'testtest' };
    it('pac-uri ftp auth (invalid)', () => {
        effectiveExpect(pacProxy(ftpUri, null, ftpAuthObj), ftpUri, ftpObj);
    });

    it('pac-uri user@pass override proxy-obj auth', () => {
        effectiveExpect(pacProxy(httpsAuthUri, null, httpsAuthObj), httpsAuthUri, httpsObj);
    });
});
