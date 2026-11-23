import { describe, expect, it } from 'vitest';

import { md5, sha1, sha256, sha512 } from '@/utils/hash';

describe('hash', () => {
    it('md5 RSSHub', () => {
        expect(md5('RSSHub')).toBe('3187d745ec5983413e4f0dce3900d92d');
    });

    it('sha1 RSSHub', () => {
        expect(sha1('RSSHub')).toBe('d24ccc61a3248f3e82c3f5c94241172a343859e8');
    });

    it('sha256 RSSHub', () => {
        expect(sha256('RSSHub')).toBe('ae5fa4f9613835bb2b2d94ed3a6e97c91ccdbf8d05c924f388e729b216693885');
    });

    it('sha512 RSSHub', () => {
        expect(sha512('RSSHub')).toBe('bc1b44370d23ffbb779e834abd2610ef7715fa4338c134bc1f94c8565b248f6ead95f649010dae49c477aeaa805523f77eb9645cec29b0de5ded96f1d89d0876');
    });
});
