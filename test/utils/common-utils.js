const utils = require('../../lib/utils/common-utils');
const cheerio = require('cheerio');

describe('common-utils', () => {
    it('toTitleCase', async () => {
        expect(utils.toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is As Awesome As Henry');
    });

    it('addNoReferrer', async () => {
        const data = "<div><img data-src='user-images.githubusercontent.com/5896343/60762836-02746d80-a060-11e9-8947-76b3b3d3b731.png' remove='remove' remove2='remove2'></div>";

        const $ = cheerio.load(data);

        utils.addNoReferrer($, 'div', 'data-src', 'https://', ['remove', 'remove2']);
        const result = $('div').html();

        expect(result).toBe('<img src="https://user-images.githubusercontent.com/5896343/60762836-02746d80-a060-11e9-8947-76b3b3d3b731.png" referrerpolicy="no-referrer">');
    });
});
