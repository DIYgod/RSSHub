const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'diyi';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const rootUrl = 'https://china.cankaoxiaoxi.com';
    const listApiUrl = `${rootUrl}/json/channel/${id}/list.json`;
    const channelApiUrl = `${rootUrl}/json/channel/${id}.channeljson`;
    const currentUrl = `${rootUrl}/#/generalColumns/${id}`;

    const listResponse = await got({
        method: 'get',
        url: listApiUrl,
    });

    const channelResponse = await got({
        method: 'get',
        url: channelApiUrl,
    });

    let items = listResponse.data.list.slice(0, limit).map((item) => ({
        title: item.data.title,
        author: item.data.userName,
        category: item.data.channelName,
        pubDate: timezone(parseDate(item.data.publishTime), +8),
        link: item.data.moVideoPath ? item.data.sourceUrl : `${rootUrl}/json/content/${item.data.url.match(/\/pages\/(.*?)\.html/)[1]}.detailjson`,
        video: item.data.moVideoPath,
        cover: item.data.mCoverImg,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.video) {
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        video: item.video,
                        cover: item.cover,
                    });
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const data = detailResponse.data;

                    item.link = `${rootUrl}/#/detailsPage/${id}/${data.id}/1/${data.publishTime.split(' ')[0]}`;
                    item.description = data.txt;
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `参考消息 - ${channelResponse.data.name}`,
        link: currentUrl,
        description: '参考消息',
        language: 'zh-cn',
        item: items,
    };
};
