import { describe, expect, it } from 'vitest';
import unifyProxy from '@/utils/proxy/unify-proxy';

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

describe('unify-proxy', () => {
    const nullExpect = (unified) => effectiveExpect(unified, undefined, emptyProxyObj);
    it('proxy empty', () => {
        nullExpect(unifyProxy('', emptyProxyObj));
    });
    it('proxy-uri invalid', () => {
        nullExpect(unifyProxy('http://inv lid.test', emptyProxyObj));
    });
    it('proxy-uri invalid protocol', () => {
        nullExpect(unifyProxy('ftp://rsshub.proxy', emptyProxyObj));
    });
    it('proxy-obj no host', () => {
        nullExpect(unifyProxy('', { ...emptyProxyObj, protocol: 'http', port: '2333' }));
    });
    it('proxy-obj invalid host', () => {
        nullExpect(unifyProxy('', { ...emptyProxyObj, protocol: 'http', host: 'inv lid.test', port: '2333' }));
    });
    it('proxy-obj invalid protocol', () => {
        nullExpect(unifyProxy('', { ...emptyProxyObj, protocol: 'ftp', host: 'rsshub.proxy', port: '2333' }));
    });

    const httpNoPortUri = 'http://rsshub.proxy';
    const httpNoPortObj = { ...emptyProxyObj, protocol: 'http', host: 'rsshub.proxy' };
    const httpNoPortExpect = (unified) => effectiveExpect(unified, httpNoPortUri, httpNoPortObj);
    it('proxy-uri http no port', () => {
        httpNoPortExpect(unifyProxy(httpNoPortUri, emptyProxyObj));
    });
    it('proxy-obj http no port', () => {
        httpNoPortExpect(unifyProxy('', httpNoPortObj));
    });

    const httpUri = 'http://rsshub.proxy:2333';
    const httpObj = { ...httpNoPortObj, port: '2333' };
    const httpExpect = (unified) => effectiveExpect(unified, httpUri, httpObj);
    it('proxy-uri http', () => {
        httpExpect(unifyProxy(httpUri, emptyProxyObj));
    });
    it('proxy-obj http', () => {
        httpExpect(unifyProxy('', httpObj));
    });

    const httpsUri = 'https://rsshub.proxy:2333';
    const httpsObj = { ...httpObj, protocol: 'https' };
    const httpsExpect = (unified) => effectiveExpect(unified, httpsUri, httpsObj);
    it('proxy-uri https', () => {
        httpsExpect(unifyProxy(httpsUri, emptyProxyObj));
    });
    it('proxy-obj https', () => {
        httpsExpect(unifyProxy('', httpsObj));
    });

    const socks5Uri = 'socks5://rsshub.proxy:2333';
    const socks5Obj = { ...httpObj, protocol: 'socks5' };
    const socks5Expect = (unified) => effectiveExpect(unified, socks5Uri, socks5Obj);
    it('proxy-uri socks5', () => {
        socks5Expect(unifyProxy(socks5Uri, emptyProxyObj));
    });
    it('proxy-obj socks5', () => {
        socks5Expect(unifyProxy('', socks5Obj));
    });

    const overrideObj = { ...emptyProxyObj, protocol: 'http', host: 'over.ride', port: '6666' };
    it('proxy-uri override proxy-obj {PROTOCAL,HOST,PORT}', () => {
        socks5Expect(unifyProxy(socks5Uri, overrideObj));
    });

    const noProtocolUri = 'rsshub.proxy:2333';
    it('proxy-uri no protocol', () => {
        httpExpect(unifyProxy(noProtocolUri, emptyProxyObj));
    });

    const noProtocolObj = { ...httpObj, protocol: undefined };
    it('proxy-obj no protocol', () => {
        httpExpect(unifyProxy('', noProtocolObj));
    });

    const protocolInHostObj = { ...httpObj, host: httpNoPortUri, protocol: undefined };
    it('proxy-obj protocol in host', () => {
        httpExpect(unifyProxy('', protocolInHostObj));
    });

    const portInHostObj = { ...httpNoPortObj, host: httpUri };
    it('proxy-obj port in host', () => {
        httpExpect(unifyProxy('', portInHostObj));
    });

    const everythingInHostObj = { ...emptyProxyObj, host: httpUri };
    it('proxy-obj everything in host', () => {
        httpExpect(unifyProxy('', everythingInHostObj));
    });

    const portBothObj = { ...portInHostObj, port: '6666' };
    it('proxy-obj port in host override proxy-obj port', () => {
        httpExpect(unifyProxy('', portBothObj));
    });

    const PortNaNObj = { ...httpNoPortObj, port: 'test' };
    it('proxy-obj port NaN', () => {
        httpNoPortExpect(unifyProxy('', PortNaNObj));
    });

    const httpsAuthUri = 'https://user:pass@rsshub.proxy:2333';
    it('proxy-uri https auth', () => {
        effectiveExpect(unifyProxy(httpsAuthUri, emptyProxyObj), httpsAuthUri, httpsObj);
    });

    const httpsAuthObj = { ...httpsObj, auth: 'testtest' };
    it('proxy-obj https auth', () => {
        effectiveExpect(unifyProxy('', httpsAuthObj), httpsUri, httpsAuthObj);
    });

    const socks5AuthUri = 'socks5://user:pass@rsshub.proxy:2333';
    it('proxy-uri socks5 auth', () => {
        effectiveExpect(unifyProxy(socks5AuthUri, emptyProxyObj), socks5AuthUri, socks5Obj);
    });

    const socks5AuthObj = { ...socks5Obj, auth: 'testtest' };
    it('proxy-obj socks5 auth (invalid)', () => {
        socks5Expect(unifyProxy('', socks5AuthObj));
    });

    it('proxy-uri user@pass override proxy-obj auth', () => {
        effectiveExpect(unifyProxy(httpsAuthUri, httpsAuthObj), httpsAuthUri, httpsObj);
    });
});
