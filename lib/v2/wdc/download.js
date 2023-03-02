const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '279';

    const rootUrl = 'https://support.wdc.com';
    const currentUrl = `${rootUrl}/downloads.aspx?p=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const version = $('#WD_lblVersionSelected').text();

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            enclosure_url: $('#WD_hlDownloadFWSelected').attr('href'),
            pubDate: parseDate($('#WD_lblReleaseDateSelected').text(), 'D/M/YYYY'),
            description: $('.toggleInner')
                .html()
                .replace(/style="color:White;"/, ''),
        },
    ];

    ctx.state.data = {
        title: `${$('#WD_lblSelectedName').text()} | WD Support`,
        link: currentUrl,
        item: items,
    };
};
