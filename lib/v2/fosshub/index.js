const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://www.fosshub.com';
    const currentUrl = `${rootUrl}/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const version = $('dd[itemprop="softwareVersion"]').first().text();

    const items = [
        {
            title: version,
            link: `${currentUrl}#${version}`,
            description: art(path.join(__dirname, 'templates/description.art'), {
                links: $('.dwn-dl')
                    .toArray()
                    .map((l) =>
                        $(l)
                            .find('.w')
                            .toArray()
                            .map((w) => ({
                                dt: $(w).find('dt').text(),
                                dd: $(w).find('dd').html(),
                            }))
                    ),
                changelog: $('div[itemprop="releaseNotes"]').html(),
            }),
            pubDate: parseDate($('.ma__upd .v').text(), 'MMM DD, YYYY'),
        },
    ];

    ctx.state.data = {
        title: `${$('#fh-ssd__hl').text()} - FossHub`,
        link: currentUrl,
        item: items,
    };
};
