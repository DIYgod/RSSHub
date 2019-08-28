const utils = require('../../lib/utils/common-utils');
const cheerio = require('cheerio');

describe('common-utils', () => {
    it('toTitleCase', async () => {
        expect(utils.toTitleCase('RSSHub IS AS aweSOme aS henry')).toBe('Rsshub Is As Awesome As Henry');
    });

    it('handleImg', async () => {
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
            utils.handleImg($);
            const result = $('div').html();
            expect(result).toBe(expectList[index]);
        });
    });
});
