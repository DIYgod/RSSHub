const md5 = require('../../lib/utils/md5');

describe('md5', () => {
    it('md5 RSSHub', async () => {
        expect(md5('RSSHub')).toBe('3187d745ec5983413e4f0dce3900d92d');
    });
});
