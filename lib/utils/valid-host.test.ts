import { describe, expect, it } from 'vitest';

import { isOnSite, isValidHost } from '@/utils/valid-host';

describe('valid-host', () => {
    it('validate hostname', () => {
        expect(isValidHost()).toBe(false);
        expect(isValidHost('')).toBe(false);
        expect(isValidHost('subd0main')).toBe(true);
        expect(isValidHost('-subd0main')).toBe(false);
        expect(isValidHost('sub-d0main')).toBe(true);
        expect(isValidHost('subd0main-')).toBe(false);
        expect(isValidHost('sub.d0main')).toBe(false);
        expect(isValidHost('sub-.d0main')).toBe(false);
        expect(isValidHost('s')).toBe(true);
        expect(isValidHost('-')).toBe(false);
        expect(isValidHost('0')).toBe(true);
        expect(isValidHost('s-')).toBe(false);
        expect(isValidHost('s-u')).toBe(true);
        expect(isValidHost('su')).toBe(true);
    });
});

describe('isOnSite', () => {
    it.each(['https://www.researchgate.net/publication/1', 'http://researchgate.net/', 'https://a.b.researchgate.net/x?y=1#z', 'HTTPS://WWW.RESEARCHGATE.NET/'])('accepts %s', (link) => {
        expect(isOnSite(link, 'researchgate.net')).toBe(true);
    });

    it.each([
        undefined,
        '',
        '/publication/1',
        '//127.0.0.1/x',
        'http://127.0.0.1:18080/x',
        'file:///etc/passwd',
        'https://www.researchgate.net@127.0.0.1/x',
        'https://www.researchgate.net.attacker.example/x',
        'https://notresearchgate.net/',
        'ftp://www.researchgate.net/',
        'javascript:alert(1)//researchgate.net',
    ])('refuses %s', (link) => {
        expect(isOnSite(link, 'researchgate.net')).toBe(false);
    });

    it('accepts any of several sites', () => {
        expect(isOnSite('https://www.nytimes.com/a', 'cn.nytimes.com', 'www.nytimes.com')).toBe(true);
        expect(isOnSite('https://nytimes.com/a', 'cn.nytimes.com', 'www.nytimes.com')).toBe(false);
    });
});
