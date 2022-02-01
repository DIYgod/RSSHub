const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.theblockbeats.info';

const channelMap = {
    flash: '快讯',
    news: '新闻',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'flash';

    const response = await got.get(rootUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.news-item')
        .map((_, item) => {
            const title = $(item).find('a').attr('title');
            const link = rootUrl + $(item).find('a').attr('href');
            const pubDate = parseRelativeDate($(item).find('div.article-time').text());

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((_, item) => item.title && item.link.includes(channel))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content(`div.${channel}-content`).html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `TheBlockBeats - ${channelMap[channel]}`,
        link: rootUrl,
        item: items,
    };
};
