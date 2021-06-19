const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.makeuseof.com';
    const currentUrl = `${rootUrl}${category === '' ? '' : '/category/' + category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.home-secondary, .listing-content')
        .find('.bc-title-link')
        .slice(0, 15)
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

                    content('.img-article-item')
                        .find('img')
                        .each(function () {
                            content(this).attr('src', content(this).prev().attr('data-srcset').split('?')[0]);
                        });

                    content('.ad-zone-container, .sharing, .sentinel-article-nextArticle, .article-tags, .w-article-author-bio, .ml-form-embedContainer').remove();

                    item.description = content('.article-body').html();
                    item.author = content('a.author').text().replace('By ', '');
                    item.pubDate = new Date(content('time').attr('datetime')).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `MakeUseOf - ${$('.listing-title').text() ? $('.listing-title').text() : 'Trending'}`,
        link: currentUrl,
        item: items,
    };
};
