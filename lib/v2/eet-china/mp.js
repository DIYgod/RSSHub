const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://www.eet-china.com';
    const currentUrl = new URL(`mp${category ? `/c${category}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.swiper-con a, div.new-title a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().trim(),
                link: item.prop('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                const relevantData = content('div.new-relevant span.hidden-xs');
                const upvotes = relevantData.eq(1).text();
                const comments = relevantData.eq(2).text();

                item.title = content('h1.detail-title').text();
                item.description = content('div.article-con').html();
                item.author = content('a.write').text();
                item.pubDate = timezone(parseDate(content('div.new-relevant span').first().text()), +8);
                item.upvotes = upvotes ? parseInt(upvotes.replace(/点赞/, ''), 10) : 0;
                item.comments = comments ? parseInt(comments.replace(/评论/, ''), 10) : 0;

                return item;
            })
        )
    );

    const icon = new URL($('div.logo-mianbaoban a img').prop('src'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: new URL($('div.logo-xinyu a img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
    };
};
