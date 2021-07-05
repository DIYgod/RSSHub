const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name || 'mouseinc';

    const rootUrl = 'https://shuax.com';
    const currentUrl = `${rootUrl}/project/${name}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.love-box').remove();

    const title = $('title').text();

    ctx.state.data = {
        title: `${title.split(' ')[0]} - 耍下`,
        link: currentUrl,
        item: [
            {
                link: currentUrl,
                title: title.replace(' – 耍下', ''),
                description: $('#page-content').html(),
                pubDate: new Date(
                    response.data
                        .match(/\d{4}年\d+月\d+日/)[0]
                        .replace(/年|月/g, '-')
                        .replace('日', '')
                ).toUTCString(),
            },
        ],
    };
};
