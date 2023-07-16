const got = require('@/utils/got');
const cheerio = require('cheerio');
// const { parseDate } = require('@/utils/parse-date');
// const timezone = require('@/utils/timezone');
// const { art } = require('@/utils/render');
// const path = require('path');
const HOME_PAGE = 'https://apnews.com';

module.exports = async (ctx) => {
    const { topic = 'trending-news' } = ctx.params;
    const url = `${HOME_PAGE}/hub/${topic}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    // const items = meta.cards
    //     .map((item) => {
    //         const description = cheerio.load(item.contents[0].storyHTML, null, false);
    //         description('.ad-placeholder').remove();
    //         return {
    //             title: item.contents[0].headline,
    //             description: art(path.join(__dirname, 'templates/description.art'), {
    //                 media: item.contents[0].media,
    //                 description: description.html(),
    //             }),
    //             link: `${HOME_PAGE}/article/${item.contents[0].canonicalUrl}-${item.contents[0].shortId}`,
    //             author: item.contents[0].bylines ? item.contents[0].bylines.slice(3) : null,
    //             pubDate: timezone(parseDate(item.contents[0].published), 0),
    //             category: item.contents[0].tagObjs.map((tag) => tag.name),
    //         };
    //     });

    const items = $(".PagePromo-content")
        .get()
        .map((e) => ({
                title: $(e).find("span.PagePromoContentIcons-text").text(),
                link: $(e).find("a").attr("href")
        }))
        .map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                return Object.assign(item, {
                    pubDate: new Date($("meta[property='article:published_time']").attr("content")),
                    updated: new Date($("meta[property='article:modified_time']").attr("content")),
                    description: $('div.RichTextStoryBody').html(),
                    category: $("meta[property='article:section']").attr("content")
                    // guid: $("meta[name='brightspot.contentId']").attr("content")
                });
            });
        );

    ctx.state.data = {
        title: $("title").text(),
        description: $("meta[property='og:description']").text(),
        link: url,
        item: items,
        language: $('html').attr('lang'),
    };
};
