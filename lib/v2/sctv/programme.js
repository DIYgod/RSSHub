const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';
    const limit = ctx.params.limit ? parseInt(ctx.params.limit) : 15;
    const isFull = /t|y/i.test(ctx.params.isFull ?? 'true');

    const rootUrl = 'https://www.sctv.com';
    const apiRootUrl = 'https://kscgc.sctv-tf.com';
    const apiUrl = `${apiRootUrl}/sctv/lookback/${id}/date.json`;
    const listUrl = `${apiRootUrl}/sctv/lookback/index/lookbackList.json`;
    const currentUrl = `${rootUrl}/column/detail?programmeIndex=/sctv/lookback/${id}/index.json`;

    let response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = [];

    const array = response.data.data.programmeArray.slice(0, limit).map((list) => ({
        guid: list.id,
        link: `${apiRootUrl}${list.programmeListUrl}`,
    }));

    await Promise.all(
        array.map((list) =>
            ctx.cache.tryGet(list.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: list.link,
                });

                const currentItems = detailResponse.data.data.programmeList.map((item) => ({
                    guid: item.id,
                    title: item.programmeTitle,
                    link: item.programmeUrl,
                    pubDate: timezone(parseDate(item.pubTime), +8),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        cover: item.programmeImage,
                        video: item.programmeUrl,
                    }),
                }));

                let currentFullItems = [];

                if (isFull) {
                    currentFullItems = currentItems.filter((item) => /（\d{4}\.\d{2}\.\d{2}）/.test(item.title));
                }

                items = [...items, ...(currentFullItems.length === 0 ? currentItems : currentFullItems)];
            })
        )
    );

    response = await got({
        method: 'get',
        url: listUrl,
    });

    let name, cover;
    for (const p of response.data.data.programme_official) {
        if (p.programmeId === id) {
            name = p.programmeName;
            cover = p.programmeCover;
            break;
        }
    }

    ctx.state.data = {
        title: `四川广播电视台 - ${name}`,
        link: currentUrl,
        item: items.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 100),
        image: cover,
    };
};
