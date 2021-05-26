const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || 'all';

    const rootUrl = 'https://daodu.tech';
    const currentUrl = `${rootUrl}${caty === 'all' ? '' : '/archive_' + caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h2[itemprop="headline"] a, .post-header .archive__article__title a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.member-only').remove();

                    item.description = content('.post-entry-text').html();
                    item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content')).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace('一覽表', ''),
        link: currentUrl,
        item: items,
    };
};
