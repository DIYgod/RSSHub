const got = require('@/utils/got');

module.exports = async (ctx) => {
    const liveUrl = `https://api.jinse.com/noah/v1/www/timelines?&limit=23&flag=down`;
    const response = await got({
        method: 'get',
        url: liveUrl,
    });

    ctx.state.data = {
        title: '金色财经 - 头条',
        link: liveUrl,
        item: response.data.data.list.map((item) => ({
            title: item.title,
            link: item.extra.topic_url,
            author: item.extra.author,
            description: item.extra.summary,
            pubDate: new Date(item.extra.published_at * 1000).toUTCString(),
        })),
    };
};
