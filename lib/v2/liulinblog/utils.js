const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const processList = (res) => {
    const $ = cheerio.load(res.data);
    const list = $('div.posts-wrapper > div.col-lg-12')
        .map((_, item) => ({
            title: $(item).find('h2.entry-title').text(),
            link: $(item).find('h2.entry-title > a').attr('href'),
            pubDate: parseDate($(item).find('time').attr('datetime')),
            author: $(item).find('span.meta-author > a').attr('title'),
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

                item.description = $('div.entry-wrapper').html();

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
