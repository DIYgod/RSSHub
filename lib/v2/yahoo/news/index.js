const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const region = ctx.params.region === 'en' ? '' : ctx.params.region.toLowerCase();
    if (!isValidHost(region) && region !== '') {
        throw Error('Invalid region');
    }
    const category = ctx.params.category ? ctx.params.category.toLowerCase() : '';
    const rssUrl = `https://${region ? region + '.' : ''}news.yahoo.com/rss/${category}`;
    const feed = await parser.parseURL(rssUrl);
    const title = feed.title;
    const link = feed.link;
    const description = feed.description;
    const filteredItems = feed.items.filter((item) => !item.link.includes('promotions') && new URL(item.link).hostname.match(/.*\.yahoo\.com$/));
    const items = await Promise.all(
        filteredItems.map(async (item) => {
            const description = await ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(response.data);
                $('.caas-content-byline-wrapper, .caas-xray-wrapper, .caas-header, .caas-readmore').remove();
                return $('.caas-content-wrapper').html();
            });
            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
            };
            return single;
        })
    );

    ctx.state.data = {
        title,
        link,
        description,
        item: items,
    };
};
