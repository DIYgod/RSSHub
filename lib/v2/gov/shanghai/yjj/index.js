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

            const link = item.attr('href');

            return {
                title: item.text(),
                pubDate: parseDate(item.next().text()),
                link: /^http/.test(link) ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    const pubDate = content('meta[name="pubdate"]').attr('content') || content('meta[name="PubDate"]').attr('content');

                    item.description = content('#ivs_content').html();
                    item.pubDate = timezone(parseDate(pubDate, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm']), +8);
                } catch (e) {
                    // no-empty
                }

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
