const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.theblockbeats.info';

const channelMap = {
    newsflash: '快讯',
    article: '文章',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'newsflash';

    const response = await got.get(`${rootUrl}/${channel}`);
    const $ = cheerio.load(response.data);
    const list = $(`div.${channel === 'newsflash' ? 'news-flash-wrapper' : 'home-news'}`)
        .map((_, item) => {
            const title = $(item).find('a').attr('title');
            const link = rootUrl + $(item).find('a').attr('href');
            const description = channel === 'newsflash' ? $(item).find('div.news-flash-item-content').html() : $(item).find('div.home-news-lft-content').text();
            return {
                title,
                link,
                description,
            };
        })
        .get();

    if (channel !== 'newsflash') {
        await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(item.link);
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div.news-content').html();

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `TheBlockBeats - ${channelMap[channel]}`,
        link: rootUrl,
        item: list,
    };
};
