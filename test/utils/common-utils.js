const utils = require('../../lib/utils/common-utils');

describe('common-utils', () => {
    it('toTitleCase', () => {
        expect(utils.toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is As Awesome As Henry');
    });
});
