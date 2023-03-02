const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const period = ctx.params.period ?? 'day';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one-wscn.awtmt.com';
    const apiUrl = `${apiRootUrl}/apiv1/content/articles/hot?period=all`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data[`${period}_items`].map((item) => ({
        guid: item.id,
        link: item.uri,
        pubDate: parseDate(item.display_time * 1000),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/apiv1/content/articles/${item.guid}?extract=0`,
                });

                const data = detailResponse.data.data;

                item.title = data.title || data.content_text;
                item.author = data.source_name ?? data.author.display_name;
                item.description = data.content + (data.content_more ?? '');
                item.category = data.asset_tags?.map((t) => t.name) ?? [];

                if (data.audio_uri) {
                    item.enclosure_type = 'audio/mpeg';
                    item.enclosure_url = data.audio_uri;
                    item.itunes_item_image = data.image?.uri ?? '';
                    item.itunes_duration = data.audio_info?.duration ?? '';
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '华尔街见闻 - 最热文章',
        link: rootUrl,
        item: items,
        itunes_author: '华尔街见闻',
        image: 'https://static-alpha-wscn.awtmt.com/wscn-static/qrcode.jpg',
    };
};
