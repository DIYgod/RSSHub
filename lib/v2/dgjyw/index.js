const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.path;

    const rootUrl = 'http://www.dgjyw.com';
    const currentUrl = `${rootUrl}${params === '/' ? '/tz' : params}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    let items = $('div.text-list ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = cheerio.load(detailResponse.data);

                content('.cont-tit').remove();
                content('.art-body').html(content('.v_news_content').html());

                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);
                item.description = content('form[name="_newscontent_fromname"]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
