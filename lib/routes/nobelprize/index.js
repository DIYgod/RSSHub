const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    physics: {
        link: 'all-nobel-prizes-in-physics',
        title: 'Physics',
    },
    chemistry: {
        link: 'all-nobel-prizes-in-chemistry',
        title: 'Chemistry',
    },
    'physiology-or-medicine': {
        link: 'all-nobel-laureates-in-physiology-or-medicine',
        title: 'Physiology or Medicine',
    },
    literature: {
        link: 'all-nobel-prizes-in-literature',
        title: 'Literature',
    },
    peace: {
        link: 'all-nobel-peace-prizes',
        title: 'Peace',
    },
    'economic-sciences': {
        link: 'all-prizes-in-economic-sciences',
        title: 'Economic Science',
    },
};

module.exports = async (ctx) => {
    let rootUrl = 'https://www.nobelprize.org/prizes/lists/all-nobel-prizes/';

    const cfg = config[ctx.params.caty];
    if (cfg) {
        rootUrl = `https://www.nobelprize.org/prizes/lists/${cfg.link}/`;
    }

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('div.by_year h3')
        .map((_, item) => {
            item = $(item);
            if (item.text().length === 4) {
                return Promise.resolve('');
            }

            const a = item.find('a');

            let description = '';

            item.nextAll().each(function () {
                if ($(this).get(0).tagName === 'p') {
                    description += `<p>${$(this).html()}</p>`;
                    return true;
                }
                return false;
            });

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(`${a.text().match(/([0-9]{4})/)[1]}-01-01 00:00:00 GMT+0`).toUTCString(),
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').eq(0).text(),
        link: rootUrl,
        item: items,
    };
};
