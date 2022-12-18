const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

art.defaults.imports.render = function (string) {
    return md.render(string);
};

module.exports = async (ctx) => {
    const rootUrl = 'https://hellogithub.com';
    const currentUrl = `${rootUrl}/periodical/volume/`;

    const buildResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];

    const apiUrl = `${rootUrl}/_next/data/${buildId}/periodical/volume.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data;
    const id = data.pageProps.volume.current_num;

    const items = [
        {
            guid: id,
            title: `No.${id}`,
            link: `${rootUrl}/periodical/volume/${id}`,
            description: art(path.join(__dirname, 'templates/volume.art'), {
                data: data.pageProps.volume.data,
            }),
        },
    ];

    ctx.state.data = {
        title: 'HelloGithub - 月刊',
        link: currentUrl,
        item: items,
    };
};
