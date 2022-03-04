const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'https://hellogithub.com';
    const currentUrl = 'https://hellogithub.com/article';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('.content .post')
        .slice(0, 10)
        .map((_, item) => {
            const a = $(item).find('a.post-title').eq(0).eq(0);
            const link = rootUrl + a.attr('href');
            return {
                title: a.text(),
                link,
                description: $(item).find('.post-description')[0].children[0].data,
                pubDate: timezone(parseDate($(item).find('.post-meta').text(), 'YYYY-MM-DD HH:mm:ss'), +8),
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
                item.description = content('.markdown-body').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'HelloGitHub - Article',
        link: currentUrl,
        item: items,
    };
};
