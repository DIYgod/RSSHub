const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.allnow.com';

module.exports = {
    rootUrl,

    processItems: async (ctx, currentUrl) => {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        const list = $('.post-list .post')
            .slice(0, ctx.params.limit ? parseInt(ctx.params.limit) : 15)
            .map((_, item) => {
                item = $(item);

                return {
                    link: `${rootUrl}${item.attr('href')}`,
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

                    item.author = detailResponse.data.match(/authorName:"(.*?)",avatar/)[1];
                    item.title = content('title')
                        .text()
                        .replace(/-全现在官方网站/, '');
                    item.pubDate = timezone(parseDate(detailResponse.data.match(/time:"(.*)",type/)[1]), +8);
                    item.category = detailResponse.data
                        .match(/tags:\[(.*)\],columns/)[1]
                        .split('},')
                        .map((category) => category.match(/title:"(.*)"/)[1]);
                    item.description = content('#article-content').html() ?? content('.summary').html() ?? '';

                    content('video').each(function () {
                        item.description += `<video src="https:${content(this).attr('src')}" controls></video>`;
                    });

                    return item;
                })
            )
        );

        return {
            title: $('title').text(),
            link: currentUrl,
            item: items,
            description: $('.desc').eq(0).text(),
        };
    },
};
