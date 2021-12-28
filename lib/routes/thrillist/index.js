const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const response = await got({
        method: 'get',
        url: `https://www.thrillist.com/${tag}`,
    });
    const url = response.url; // got will make sure that this is the final URL after redirects

    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');

    const list = $('div.golSS > a,div.cAtWxS > a')
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
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const body = content('div.hjroUg');

                const dateContent = content('p.iNefBF').text();
                const dateRegex = dateContent.match(/(\d+\/\d+\/\d+) at (\d+:\d+ [A-Za-z]*)/);
                const dateString = dateRegex[1] + ' ' + dateRegex[2];

                // // remove extra body content that we don't want to see
                body.find('div.article-header__mobile-top-row').remove();
                body.find('p.iNefBF').remove();
                body.find('h1.ixrfny').remove();
                body.find('div.bStUVN').remove();
                body.find('span.dgtYLN').remove();

                item.title = content('meta[property="og:title"]').attr('content');
                item.description = body.html();
                item.pubDate = new Date(dateString).toUTCString();

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
