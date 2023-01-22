const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.woshipm.com';

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);

        const $ = cheerio.load(response);
        $('.support-author').remove();

        item.description = $('.article--content').html();

        return item;
    });

module.exports = {
    baseUrl,
    parseArticle,
};
