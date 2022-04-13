const got = require('@/utils/got');

async function loadFullPage(ctx, id) {
    const link = `https://apis.guokr.com/minisite/article/${id}.json`;
    const content = await ctx.cache.tryGet(link, async () => {
        const res = await got(link);
        return res.data.result.content;
    });
    return content;
}

const channelMap = {
    calendar: 'pac',
    institute: 'predator',
    foodlab: 'predator',
    pretty: 'beauty',
};

module.exports = async (ctx) => {
    const channel = channelMap[ctx.params.channel] ? channelMap[ctx.params.channel] : ctx.params.channel;

    const response = await got(`https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_wx&channel_key=${channel}&offset=0&limit=10`);
    const items = response.data.result;

    if (items.length === 0) {
        throw 'Unknown channel';
    }

    const channel_name = items[0].channels[0].name;
    const channel_url = items[0].channels[0].url;

    const result = await Promise.all(
        items.map(async (item) => ({
            title: item.title,
            description: await loadFullPage(ctx, item.id), // Mercury 无法正确解析全文，故这里手动加载
            pubDate: item.date_published,
            link: item.url,
            author: item.author.nickname,
        }))
    );

    ctx.state.data = {
        title: `果壳网 ${channel_name}`,
        link: channel_url,
        item: result,
    };
};
