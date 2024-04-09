const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const domain = 'theblockbeats.info';
const rootUrl = `https://www.${domain}`;
const apiBase = `https://api.${domain}`;

const channelMap = {
    newsflash: {
        title: '快讯',
        link: `${rootUrl}/newsflash`,
        api: `${apiBase}/v5/newsflash/select`,
    },
    article: {
        title: '文章',
        link: `${rootUrl}/article`,
        api: `${apiBase}/v5/Information/newsall`,
    },
};

module.exports = async (ctx) => {
    const { channel = 'newsflash' } = ctx.params;

    const { data: response } = await got(channelMap[channel].api);

    const { data } = channel === 'newsflash' ? response.data : response;
    let list = data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${channel === 'newsflash' ? 'flash' : 'news'}/${item.id}`,
        description: item.content ?? item.im_abstract,
        pubDate: parseDate(item.add_time, 'X'),
    }));

    if (channel !== 'newsflash') {
        list = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);
                    item.description = $('div.news-content').html();
                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `TheBlockBeats - ${channelMap[channel].title}`,
        link: channelMap[channel].link,
        item: list,
    };
};
