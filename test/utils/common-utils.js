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

    it('resolveLazyLoadImage', async () => {
        const testSet = [
            '<div><img lazyload="http://user-images.test.com/6b3b3d3b731.png" remove="http://githubusercontent.com/b3b3d3b731.png"></div>',
            '<div><img data-src="https://user-images.test.com/3d3b731.webp" remove="remove" remove2="remove2"></div>',
            '<div><img src="//user-images.githubusercontent.com/3d3b731.gif" remove="remove"></div>',
        ];
        const expectList = [
            '<img lazyload="http://user-images.test.com/6b3b3d3b731.png" remove="http://githubusercontent.com/b3b3d3b731.png" src="http://user-images.test.com/6b3b3d3b731.png" referrerpolicy="no-referrer">',
            '<img data-src="https://user-images.test.com/3d3b731.webp" remove="remove" remove2="remove2" src="https://user-images.test.com/3d3b731.webp" referrerpolicy="no-referrer">',
            '<img src="//user-images.githubusercontent.com/3d3b731.gif" remove="remove" referrerpolicy="no-referrer">',
        ];
        testSet.forEach((htmlStr, index) => {
            const $ = cheerio.load(htmlStr);
            utils.resolveLazyLoadImage($);
            const result = $('div').html();
            expect(result).toBe(expectList[index]);
        });
    });
});
