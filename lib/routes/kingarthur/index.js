const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const response = await got({
        method: 'get',
        url: `https://www.kingarthurbaking.com/blog/category/${type}/`,
    });
    const url = response.url; // got will make sure that this is the final URL after redirects

    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('meta[property="og:site_name"]').attr('content');
    const description = $('meta[property="og:site_name"]').attr('content');

    const list = $('div.article > a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const itemURL = new URL(item.attr('href'), url).href;
            return {
                link: itemURL,
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

                    const body = content('div.article__body');

                    // remove extra body content that we don't want to see
                    body.find('blockquote').remove();

                    item.title = content('meta[property="og:title"]').attr('content');
                    item.description = body.html();
                    item.pubDate = new Date(content('div.stat__item--date > span').text()).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title,
        link: url,
        description,
        item: items,
    };
};
