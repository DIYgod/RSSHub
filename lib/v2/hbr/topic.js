const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const topic = ctx.params.topic ?? 'leadership';
    const type = ctx.params.type ?? 'Latest';

    const rootUrl = 'https://hbr.org';
    const currentUrl = `${rootUrl}/topic/${topic}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(`stream-content[data-stream-name="${type}"]`)
        .find('.stream-item')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('data-title'),
                author: item.attr('data-authors'),
                category: item.attr('data-topic'),
                link: `${rootUrl}${item.attr('data-url')}`,
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

                item.description = content('.article-body, article[itemprop="description"]').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').eq(0).text()} - ${type}`,
        link: currentUrl,
        item: items,
    };
};
