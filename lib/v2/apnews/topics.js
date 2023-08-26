const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const HOME_PAGE = 'https://apnews.com';

module.exports = async (ctx) => {
    const { topic = 'trending-news' } = ctx.params;
    const url = `${HOME_PAGE}/hub/${topic}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('.PagePromo-content')
            .get()
            .map((e) => ({
                title: $(e).find('span.PagePromoContentIcons-text').text(),
                link: $(e).find('a').attr('href'),
            }))
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);
                    $('div.Enhancement').remove();
                    return Object.assign(item, {
                        pubDate: timezone(new Date($("meta[property='article:published_time']").attr('content')), 0),
                        updated: timezone(new Date($("meta[property='article:modified_time']").attr('content')), 0),
                        description: $('div.RichTextStoryBody').html(),
                        category: $("meta[property='article:section']").attr('content'),
                        guid: $("meta[name='brightspot.contentId']").attr('content'),
                    });
                })
            )
    );

    ctx.state.data = {
        title: $('title').text(),
        description: $("meta[property='og:description']").text(),
        link: url,
        item: items,
        language: $('html').attr('lang'),
    };
};
