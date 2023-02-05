const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const newflashApi = 'https://api.theblockbeats.info/v3/newsflash/select';
const articleApi = 'https://api.theblockbeats.info/v3/Information/newsall';

const rootUrl = 'https://www.theblockbeats.info';

const channelMap = {
    newsflash: '快讯',
    article: '文章',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'newsflash';
    const { data: response } = await got(channel === 'newsflash' ? newflashApi : articleApi);
    const { data } = channel === 'newsflash' ? response.data : response;
    const list = data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${channel === 'newsflash' ? 'flash' : 'news'}/${item.id}`,
        description: item.content ?? item.im_abstract,
        pubDate: parseDate(item.add_time, 'X'),
    }));

    if (channel !== 'newsflash') {
        await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
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
