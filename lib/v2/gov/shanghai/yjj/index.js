const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.path === '/shanghai/yjj' ? '/shanghai/yjj/zx-ylqx' : ctx.path;

    const rootUrl = 'https://yjj.sh.gov.cn';
    const currentUrl = `${rootUrl}${params.replace(/^\/shanghai\/yjj/, '')}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.pageList li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.next().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('#ivs_content').html();
                item.pubDate = timezone(parseDate(content('meta[name="pubdate"]').attr('content')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace(/--/, ' - '),
        link: currentUrl,
        item: items,
    };
};
