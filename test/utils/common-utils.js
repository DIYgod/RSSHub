const utils = require('../../lib/utils/common-utils');

describe('common-utils', () => {
    it('toTitleCase', () => {
        expect(utils.toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is As Awesome As Henry');
    });

    const date = new Date('2019-01-01');

    it('convertDateToISO8601', () => {
        expect(utils.convertDateToISO8601('')).toBe('');
        expect(utils.convertDateToISO8601(null)).toBe(null);
        expect(utils.convertDateToISO8601(undefined)).toBe(undefined);

        const expected = date.toISOString();
        expect(utils.convertDateToISO8601(date)).toBe(expected);
        expect(utils.convertDateToISO8601(date.toISOString())).toBe(expected);
        expect(utils.convertDateToISO8601(date.toUTCString())).toBe(expected);
        expect(utils.convertDateToISO8601(date.toLocaleString())).toBe(expected);
        expect(utils.convertDateToISO8601('Tue, 01 Jan 2019 08:00:00 UTC+8')).toBe(expected);

        expect(utils.convertDateToISO8601('Tue, 01 Jan 2019 00:00:00')).toBe(new Date(date.getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString());
        expect(() => utils.convertDateToISO8601('something invalid')).toThrow(RangeError);
    });

    it('convertDateToRFC2822', () => {
        expect(utils.convertDateToRFC2822('')).toBe('');
        expect(utils.convertDateToRFC2822(null)).toBe(null);
        expect(utils.convertDateToRFC2822(undefined)).toBe(undefined);

        const expected = date.toUTCString();
        expect(utils.convertDateToRFC2822(date)).toBe(expected);
        expect(utils.convertDateToRFC2822(date.toISOString())).toBe(expected);
        expect(utils.convertDateToRFC2822(date.toUTCString())).toBe(expected);
        expect(utils.convertDateToRFC2822(date.toLocaleString())).toBe(expected);
        expect(utils.convertDateToRFC2822('Tue, 01 Jan 2019 08:00:00 UTC+8')).toBe(expected);

        expect(utils.convertDateToRFC2822('Tue, 01 Jan 2019 00:00:00')).toBe(new Date(date.getTime() + new Date().getTimezoneOffset() * 60 * 1000).toUTCString());
        expect(() => utils.convertDateToRFC2822('something invalid')).toThrow(RangeError);
    });

    it('collapseWhitespace', () => {
        expect(utils.collapseWhitespace('')).toBe('');
        expect(utils.collapseWhitespace(null)).toBe(null);
        expect(utils.collapseWhitespace(undefined)).toBe(undefined);
        expect(utils.collapseWhitespace('   \n\n\n    ')).toBe('');
        expect(utils.collapseWhitespace('a string already collapsed')).toBe('a string already collapsed');
        expect(utils.collapseWhitespace(' \n  a lot of     whitespaces   and \n\n\n\n linebreaks   \n\n ')).toBe('a lot of whitespaces and linebreaks');
    });
});
