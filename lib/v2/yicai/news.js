const got = require('@/utils/got');

const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    let channel;
    if (id) {
        const navUrl = `${rootUrl}/api/ajax/getnavs`;

        const response = await got({
            method: 'get',
            url: navUrl,
        });

        for (const c of response.data.header.news) {
            if (c.EnglishName === id || c.ChannelID === id) {
                channel = {
                    id: c.ChannelID,
                    name: c.ChannelName,
                    slug: c.EnglishName,
                };
                break;
            }
        }
    }

    const currentUrl = `${rootUrl}/news${id ? `/${channel.slug}` : ''}`;
    const apiUrl = `${rootUrl}/api/ajax/${id ? `getlistbycid?cid=${channel.id}` : 'getjuhelist?action=news'}&page=1&pagesize=${ctx.query.limit ?? 30}`;

    const items = await ProcessItems(apiUrl, ctx.cache.tryGet);

    ctx.state.data = {
        title: `第一财经 - ${channel?.name ?? '新闻'}`,
        link: currentUrl,
        item: items,
    };
};
