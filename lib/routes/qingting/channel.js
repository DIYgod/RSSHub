const got = require('@/utils/got');

module.exports = async (ctx) => {
    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${ctx.params.id}`;
    let response = await got({
        method: 'get',
        url: channelUrl,
    });
    const title = response.data.data.title;
    const programUrl = `https://i.qingting.fm/capi/channel/${ctx.params.id}/programs/${response.data.data.v}?curpage=1&pagesize=10&order=asc`;
    response = await got({
        method: 'get',
        url: programUrl,
    });

    const items = response.data.data.programs.map((item) => ({
        title: item.title,
        link: `https://www.qingting.fm/channels/${ctx.params.id}/programs/${item.id}/`,
        pubDate: new Date(item.update_time).toUTCString(),
    }));

    ctx.state.data = {
        title: `${title} - 蜻蜓FM`,
        link: `https://www.qingting.fm/channels/${ctx.params.id}`,
        item: await Promise.all(
            items.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        response = await got({ method: 'get', url: item.link });
                        const data = JSON.parse(response.data.match(/},"program":(.*?),"plist":/)[1]);
                        item.description = data.richtext;
                        return item;
                    })
            )
        ),
    };
};
