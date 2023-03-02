const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});
const cheerio = require('cheerio');

art.defaults.imports.render = function (string) {
    return md.render(string);
};

module.exports = async (ctx) => {
    const rootUrl = 'https://hellogithub.com';
    const apiUrl = 'https://api.hellogithub.com/v1/periodical/';

    const periodicalResponse = await got({
        method: 'get',
        url: apiUrl,
    });
    const current = periodicalResponse.data.volumes[0].num;
    const currentUrl = `${rootUrl}/periodical/volume/${current}`;
    const buildResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(buildResponse.data);

    const text = $('#__NEXT_DATA__').text();
    const response = JSON.parse(text);
    const data = response.props;
    const id = data.pageProps.volume.current_num;

    const items = [
        {
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
