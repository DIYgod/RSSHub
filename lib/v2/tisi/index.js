const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.tisi.org';

module.exports = async (ctx) => {
    const url = `${rootUrl}/?page_id=11151`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div.new-artice-list-box')
        .map((_, item) => ({
            title: $(item).find('p.new-article-title > a').text(),
            link: new URL($(item).find('p.new-article-title > a').attr('href'), rootUrl).href,
            pubDate: parseDate($(item).find('p.new-article-date > span.left-span').text()),
            category: $(item).find('p.new-article-date > span:nth-child(1)').text(),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);
                item.description = content('div.article-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '腾讯研究院 - 最近更新',
        link: url,
        item: items,
    };
};
