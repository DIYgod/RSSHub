const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const subcategory = ctx.params.subcategory;
    const rssUrl = subcategory
        ? `https://www.chicagotribune.com/arcio/rss/category/${category}/${subcategory}/?query=display_date:%5Bnow-2d+TO+now%5D+AND+revision.published:true&sort=display_date:desc#nt=instory-link`
        : `https://www.chicagotribune.com/arcio/rss/category/${category}/?query=display_date:%5Bnow-2d+TO+now%5D+AND+revision.published:true&sort=display_date:desc#nt=instory-link`;
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    method: 'get',
                });
                const html = response.body;
                const $ = cheerio.load(html);
                const content = $('article > main > section#left');

                const categories = $('meta[property="article:section"]')
                    .attr('content')
                    .split(',')
                    .map((e) => e.trim())
                    .filter((e) => e !== '');

                // Disable image lazyloading
                content.find('img').each((i, e) => {
                    e = $(e);
                    e.attr('src', e.attr('data-src'));
                });

                // Remove unwanted DOMs
                const unwanted_element_selectors = [
                    '[data-pb-name="Recommender"]',
                    '.inline-ad',
                    '[data-type="newsletter-promo-card"]',
                    '[data-type="interstitial_link"]',
                    '[data-type="recommender"]',
                    '.recommender',
                    '[class*="pb-f-ads-"]',
                ];
                for (const selector of unwanted_element_selectors) {
                    content.find(selector).each((i, e) => {
                        $(e).remove();
                    });
                }

                return {
                    title: item.title.trim(),
                    id: item.guid,
                    pubDate: new Date(item.pubDate).toUTCString(),
                    author: item.creator.trim(),
                    link: item.link,
                    summary: item.content.trim(),
                    description: content.html(),
                    category: categories,
                    icon: 'https://www.chicagotribune.com/pb/resources/images/ct_icons/144-iTunesArtwork.png',
                    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Chicago_Tribune_Logo.svg',
                };
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en-us',
        icon: 'https://www.chicagotribune.com/pb/resources/images/ct_icons/144-iTunesArtwork.png',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Chicago_Tribune_Logo.svg',
    };
};
