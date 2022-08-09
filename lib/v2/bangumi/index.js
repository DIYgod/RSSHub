const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const isLatest = ctx.path === '/';
    const rootUrl = 'https://bangumi.moe';

    let response;
    let tag_id = [];

    if (isLatest) {
        const apiUrl = `${rootUrl}/api/torrent/latest`;

        response = await got({
            method: 'get',
            url: apiUrl,
        });
    } else {
        const tagUrl = `${rootUrl}/api/tag/search`;
        const torrentUrl = `${rootUrl}/api/torrent/search`;

        const params = ctx.path.split('/').slice(1);

        tag_id = await Promise.all(
            params.map((param) =>
                ctx.cache.tryGet(param, async () => {
                    const paramResponse = await got({
                        method: 'post',
                        url: tagUrl,
                        json: {
                            name: decodeURIComponent(param),
                            keywords: true,
                            multi: true,
                        },
                    });

                    return paramResponse.data.found ? paramResponse.data.tag.map((tag) => tag._id)[0] : '';
                })
            )
        );

        response = await got({
            method: 'post',
            url: torrentUrl,
            json: {
                tag_id,
            },
        });
    }

    let items =
        response.data.torrents?.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30).map((item) => ({
            title: item.title,
            link: `${rootUrl}/torrent/${item._id}`,
            description: item.introduction,
            pubDate: parseDate(item.publish_time),
            enclosure_url: item.magnet,
            enclosure_type: 'application/x-bittorrent',
            category: item.tag_ids,
        })) ?? [];

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${rootUrl}/api/tag/fetch`,
                    json: {
                        _ids: item.category,
                    },
                });

                item.category = [];

                for (const tag of detailResponse.data) {
                    for (const t of tag.synonyms) {
                        item.category.push(t);
                    }
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '萌番组 Bangumi Moe',
        link: isLatest || items.length === 0 ? rootUrl : `${rootUrl}/search/${tag_id.join('+')}`,
        item: items,
        allowEmpty: true,
    };
};
