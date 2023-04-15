const got = require('@/utils/got');
const cheerio = require('cheerio');

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

        const $ = cheerio.load(detailResponse.data);

        $('.article-nfh-icon, .article-crumb, .article-share, .article-copyright').remove();

        item.description += $('#content').html() ?? '';
        item.author = $('meta[name="author"]').attr('content');

        return item;
    });

module.exports = {
    parseArticle,
};
