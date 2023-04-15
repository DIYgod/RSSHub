const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://xd.x6d.com';

module.exports = async (ctx) => {
    let query;

    const { id = 'latest' } = ctx.params;

    const currentUrl = id === 'latest' ? baseUrl : `${baseUrl}/html/${id}.html`;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    $('i.rj').remove();

    if (id === 'latest') {
        query = $('#newslist ul')
            .eq(0)
            .find('li')
            .not('.addd')
            .find('a')
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 22);
    } else {
        query = $('a.soft-title').slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10);
    }

    const list = query.toArray().map((item) => {
        item = $(item);
        return {
            title: item.text(),
            link: `${baseUrl}${item.attr('href')}`,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = cheerio.load(detailResponse);

                item.description = content('div.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text()), 8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `小刀娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
};
