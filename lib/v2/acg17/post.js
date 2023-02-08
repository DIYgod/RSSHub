const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://acg17.com/';

module.exports = async (ctx) => {
    const response = await got(`${host}/blog`);
    const $ = cheerio.load(response.data);
    const list = $('.post-listing.archive-box').children();

    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.post-box-title').children().text();
            let itemDate = item.find('.tie-date').text();
            itemDate = itemDate
                .replace('年', '-')
                .replace('月', '-')
                .substring(0, itemDate.length - 1);
            const itemUrl = item.find('.post-box-title').children().attr('href');
            return ctx.cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = cheerio.load(result.data);
                const description = $('.entry').html().trim();
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    ctx.state.data = {
        title: `ACG17 - 全部文章`,
        link: `${host}/post`,
        description: 'ACG17 - 全部文章',
        item: items,
    };
};
