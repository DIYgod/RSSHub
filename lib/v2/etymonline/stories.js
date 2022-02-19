const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const host = 'https://www.etymonline.com';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.etymonline.com/columns?ref=etymonline_homepage',
        headers: {
            Referer: host,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);

    let items = $('.ant-col-sm-8')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3.card__title--1ls9E p').text(),
                link: host + item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    headers: {
                        Referer: host,
                    },
                });

                const $$ = cheerio.load(response.data);

                const upload_data = $$('.post__date--1iMCz').text();

                item.description = $$('.ant-col-xs-24').html().trim().replace(/src="/g, `src="${host}`);
                item.pubDate = parseDate(upload_data, 'MMMM DD, YYYY at h:mm a');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Etymonline Latest Stories',
        link: 'https://www.etymonline.com/columns?ref=etymonline_homepage',
        item: items,
    };
};
