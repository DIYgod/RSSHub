import { describe, expect, it } from 'vitest';

import { getForumUrl } from '../lib/routes/2048/utils';

describe('2048 forum address discovery', () => {
    it('follows the current address page anchor', () => {
        expect(getForumUrl('<a class="button" href="/bbs.php" target="_blank">Forum</a>')).toBe('https://2048.info/bbs.php');
    });

    it('accepts the previous onclick format', () => {
        expect(getForumUrl('<button class="button" onclick="window.open(\'https://forum.example/\')">Forum</button>')).toBe('https://forum.example/');
    });

    it('rejects missing links before they can be cached as /undefined', () => {
        expect(() => getForumUrl('<html>Unavailable</html>')).toThrow('did not contain a forum link');
    });

    it('rejects script URLs', () => {
        expect(() => getForumUrl('<a class="button" href="javascript:void(0)">Forum</a>')).toThrow('unsupported forum URL');
    });
});
