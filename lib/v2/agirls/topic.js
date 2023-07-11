const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const baseUrl = 'https://agirls.aotter.net';
    const topic = ctx.params.topic;

    const response = await got({
        url: `${baseUrl}/topic/${topic}`,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);

    let items = $('.ag-post-item__link')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        })
        .get();

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: `${baseUrl}/topic/${topic}`,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                // Tags are displayed in both the header and footer.
                item.category = Array.from(new Set(content('.ag-article__tag')
                    .toArray()
                    .map((e) => content(e).text().trim().replace('#', ''))));

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    desc: content('.ag-article').html(),
                });
                item.pubDate = timezone(parseDate(content('time').text().trim(), 'YYYY/MM/DD'), +8);
                item.author = content('.ag-article__authorlink').text().trim();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: `${baseUrl}/topic/${topic}`,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };

    ctx.state.json = {
        title: $('head title').text().trim(),
        link: `${baseUrl}/topic/${topic}`,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };
};
