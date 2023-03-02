const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const processList = (res) => {
    const $ = cheerio.load(res.data);
    const list = $('div.archive.container > div.row > div > div > div.row.posts-wrapper.scroll > div')
        .map((_, item) => ({
            title: $(item).find('h2.entry-title').text(),
            link: $(item).find('h2.entry-title > a').attr('href'),
            pubDate: parseDate($(item).find('time').attr('datetime')),
            author: '60秒读懂世界',
        }))
        .get();

    return list;
};

const processItems = async (list, ctx) => {
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);
                const fullContent = $('div > div.entry-wrapper > div.entry-content');
                fullContent.find('img').remove();
                fullContent.find('div.pt-0').remove();
                fullContent.find('div.post-note').remove();
                item.description = fullContent.html();

                return item;
            })
        )
    );

    return items;
};

module.exports = {
    processList,
    processItems,
};
