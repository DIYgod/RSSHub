const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://blog.simpleinfo.cc';
    const currentUrl = `${rootUrl}/${category === 'work' || category === 'talk' ? `blog/${category}` : `shasha77${category === 'all' ? '' : `/?category=${category}`}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.-ad').remove();

    const list = $('.article-item')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: item.find('a').eq(0).attr('href'),
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

                item.author = content('meta[property="article:author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.description = `<img src="${content('meta[property="og:image"]').attr('content')}">${content('.article-content').html()}`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.-active').text()} - 簡訊設計`,
        link: currentUrl,
        item: items,
    };
};
