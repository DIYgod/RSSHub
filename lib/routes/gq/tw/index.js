const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '';
    ctx.params.subcaty = ctx.params.subcaty || '';

    const rootUrl = 'https://www.gq.com.tw';
    const currentUrl = `${rootUrl}${ctx.params.caty === '' ? '' : '/' + ctx.params.caty}${ctx.params.subcaty === '' ? '' : '/' + ctx.params.subcaty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('a[data-test-id="NavElement"]').remove();
    $('a[data-test-id="Link"]').remove();
    $('a[data-test-id="FooterLink"]').remove();

    const list = $('a[data-test-id]')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
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

                    item.title = content('h1').text();

                    const article = content('section[data-test-id="ArticleBodyContent"]').html();
                    const gallery = content('section[data-test-id="GalleryImage"]').html();

                    if (ctx.params.caty === 'video') {
                        item.description = content('div[data-test-id="EmbedIframe"]').html() + content('p[data-test-id="DekText"]').parent().html();
                        item.pubDate = new Date(detailResponse.data.match(/pubDate":"(.*?)","channel/)[1]).toUTCString();
                    } else if (gallery !== null) {
                        item.description = gallery;
                        item.pubDate = new Date(detailResponse.data.match(/pubDate":"(.*?)","items/)[1]).toUTCString();
                    } else {
                        item.description = article;
                        item.pubDate = new Date(detailResponse.data.match(/pubDate":"(.*?)","publishedRevisions/)[1]).toUTCString();
                    }

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').eq(0).text()} - GQ Taiwan`,
        link: currentUrl,
        item: items,
    };
};
