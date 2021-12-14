const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const currentUrl = 'http://www.medsci.cn';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.composs-panel-inner div.composs-blog-list div.item div.item-content h2 a.ms-link')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: date(item.parent().parent().find('span.item-meta-item').eq(0).text()),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);
                const publishedTime = detailResponse.data.match(/"publishedTime":"(.*?)","publishedTimeString"/);

                const type = item.link.split('/')[3];

                item.pubDate = publishedTime ? new Date(publishedTime[1]).toUTCString() : item.pubDate;
                item.description = type === 'article' ? content('div.article-content-box').html() : content('shortcode-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '梅斯医学 - 推荐',
        link: currentUrl,
        item: items,
    };
};
