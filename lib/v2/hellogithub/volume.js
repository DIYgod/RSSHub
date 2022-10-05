const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

art.defaults.imports.render = function (string) {
    return md.render(string);
};

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const rootUrl = 'https://hellogithub.com';
    const apiRootUrl = 'https://api.hellogithub.com';
    const currentUrl = `${rootUrl}/periodical/volume/`;
    const apiUrl = `${apiRootUrl}/v1/volume/all/`;

    const buildResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        guid: item.num,
        title: `No.${item.num}`,
        link: `${rootUrl}/periodical/volume/${item.guid}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailUrl = `${rootUrl}/_next/data/${buildId}/periodical/volume/${item.guid}.json`;

                const detailResponse = await got({
                    method: 'get',
                    url: detailUrl,
                });

                const data = detailResponse.data;

                item.pubDate = parseDate(data.pageProps.volume.publish_at);
                item.description = art(path.join(__dirname, 'templates/volume.art'), {
                    data: data.pageProps.volume.data,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'HelloGithub - 月刊',
        link: currentUrl,
        item: items,
    };
};
