const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://ifi-audio.com';

module.exports = async (ctx) => {
    const { val, id } = ctx.params;

    const url = host + '/wp-admin/admin-ajax.php';
    const response = await got({
        method: 'post',
        url,
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'action=ifi-ff-get-firmware&val=' + val + '&id=' + id,
    });
    const markup = response.data.data.markup;
    const $ = cheerio.load(markup);
    const latestTitle = $('li[data-category=firmware]:first h4').text();
    const latestDownloadLink = $('li[data-category=firmware]:first a').attr('href');
    ctx.state.data = {
        title: 'iFi audio Download Hub',
        link: 'https://ifi-audio.com/download-hub/',
        description: 'iFi audio Download Hub',
        item: [
            {
                title: latestTitle,
                description: markup,
                link: latestDownloadLink,
            },
        ],
    };
};
