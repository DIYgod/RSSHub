const got = require('@/utils/got');

module.exports = async (ctx) => {
    const liveUrl = `https://api.jinse.com/v6/www/information/list?catelogue_key=${ctx.params.caty}&limit=23&flag=down`;
    const response = await got({
        method: 'get',
        url: liveUrl,
    });

    ctx.state.data = {
        title: `金色财经 - ${ctx.params.caty}`,
        link: liveUrl,
        item: response.data.list.map((item) => ({
            title: item.title,
            link: item.extra.topic_url,
            description: item.extra.summary,
            pubDate: new Date(item.extra.published_at * 1000).toUTCString(),
        })),
    };
};
