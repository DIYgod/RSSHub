const { pacProxy } = require('../../lib/utils/pac-proxy');

const emptyProxyObj = {
    protocol: undefined,
    host: undefined,
    port: undefined,
    auth: undefined,
    url_regex: '.*',
};

const effectiveExpect = ({ proxyUri }, expectUri) => {
    expect(proxyUri).toBe(expectUri);
};

describe('pac-proxy', () => {
    const nullExpect = (pac) => effectiveExpect(pac, null);
    it('pac empty', () => {
        nullExpect(pacProxy(null, null, emptyProxyObj));
    });
    it('pac-uri invalid', () => {
        nullExpect(pacProxy('http://inv ild.test', null, emptyProxyObj));
    });

    const httpUri = 'http://rsshub.proxy/pac.pac';
    it('pac-uri http', () => {
        effectiveExpect(pacProxy(httpUri, null, emptyProxyObj), httpUri);
    });

    const httpsUri = 'https://rsshub.proxy/pac.pac';
    it('pac-uri https', () => {
        effectiveExpect(pacProxy(httpsUri, null, emptyProxyObj), httpsUri);
    });

    const ftpUri = 'ftp://rsshub.proxy/pac.pac';
    it('pac-uri ftp', () => {
        effectiveExpect(pacProxy(ftpUri, null, emptyProxyObj), ftpUri);
    });

    const fileUri = 'file:///path/to/pac.pac';
    it('pac-uri file', () => {
        effectiveExpect(pacProxy(fileUri, null, emptyProxyObj), fileUri);
    });

    const dataPacScript = "function FindProxyForURL(url, host){return 'DIRECT';}";
    const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(dataPacScript);
    it('pac-script data', () => {
        effectiveExpect(pacProxy(null, dataPacScript, emptyProxyObj), dataUri);
    });
});
