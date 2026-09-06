import { describe, expect, it } from 'vitest';

import md5 from '@/utils/md5';

describe('md5', () => {
    it('md5 RSSHub', () => {
        expect(md5('RSSHub')).toBe('3187d745ec5983413e4f0dce3900d92d');
    });
});
