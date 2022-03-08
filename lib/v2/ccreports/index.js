const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.ccreports.com.cn';

module.exports = async (ctx) => {
    const listData = await got.get(rootUrl);
    const $ = cheerio.load(listData.data);
    const list = $('div.index-four-content > div.article-box')
        .find('div.new-child')
        .map((_, item) => ({
            title: $(item).find('p.new-title').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            author: $(item)
                .find('p.new-desc')
                .text()
                .match(/作者：(.*?)\s/)[1],
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailData = await got.get(item.link);
                const $ = cheerio.load(detailData.data);
                item.description = $('div.pdbox').html();
                item.pubDate = timezone(parseDate($('div.newbox > div.newtit > p').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '消费者报道',
        link: rootUrl,
        item: items,
    };
};
