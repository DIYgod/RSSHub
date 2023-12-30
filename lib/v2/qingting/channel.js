const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${ctx.params.id}`;
    let response = await got(channelUrl);
    const title = response.data.data.title;
    const programUrl = `https://i.qingting.fm/capi/channel/${ctx.params.id}/programs/${response.data.data.v}?curpage=1&pagesize=10&order=asc`;
    response = await got(programUrl);

    const items = response.data.data.programs.map((item) => ({
        title: item.title,
        link: `https://www.qingting.fm/channels/${ctx.params.id}/programs/${item.id}/`,
        pubDate: timezone(parseDate(item.update_time), +8),
    }));

    ctx.state.data = {
        title: `${title} - 蜻蜓FM`,
        link: `https://www.qingting.fm/channels/${ctx.params.id}`,
        item: await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    response = await got(item.link);
                    const data = JSON.parse(response.data.match(/},"program":(.*?),"plist":/)[1]);
                    item.description = data.richtext;
                    return item;
                })
            )
        ),
    };
};
