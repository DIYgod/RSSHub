const timezone = require('../../lib/utils/timezone');

describe('timezone', () => {
    it('timezone', async () => {
        const offset = 8;
        const date1 = new Date();
        const date2 = new Date(date1.getTime() - 60 * 60 * 1000 * offset);
        expect(timezone(date1.toUTCString(), offset)).toEqual(date2.toUTCString());
    });
});
