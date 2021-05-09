const got = require('@/utils/got');
const cheerio = require('cheerio');
const parseDate = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'latest';

    const rootUrl = 'https://daily.bandcamp.com';
    const currentUrl = `${rootUrl}/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list-article .title-wrapper .title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                    content('article-type, article-title, article-credits, article-playbutton, article-footer').remove();

                    content('.player-wrapper, bamplayer-art, mplayer-artist, mplayer-sidebar').remove();

                    item.description = content('article').html();
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
