const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rssUrl = new URL('/rss.php', 'https://www.phoronix.com');
    rssUrl.searchParams.set('page', ctx.params.page);
    if (ctx.params.queryOrItem) {
        if (ctx.params.page === 'category') {
            rssUrl.searchParams.set('item', ctx.params.queryOrItem);
        } else {
            rssUrl.searchParams.set('q', ctx.params.queryOrItem);
        }
    }

    const feed = await parser.parseURL(rssUrl.toString());

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const html = response.body;
                    const $ = cheerio.load(html);
                    const content = $('.content');

                    // Maybe it's paginated
                    const links = [];
                    $('.pagination > a').each((_i, pager) => {
                        const link = pager.attribs.href;
                        links.push(link);
                    });

                    const pages = await Promise.all(
                        links.map(
                            async (link) =>
                                await ctx.cache.tryGet(link, async () => {
                                    const response = await got(item.link);
                                    const html = response.body;
                                    const $$ = cheerio.load(html);
                                    const page = $$('.content');
                                    return page.html();
                                })
                        )
                    );
                    content.append(pages);

                    // Summary
                    const summary = $('.content > p:nth-child(1)');

                    // Author
                    const author = [];
                    const authorSelector = $('.author > a');
                    // thel last 2 are the category and comments
                    authorSelector.slice(0, authorSelector.length - 2).each((_i, e) => author.push(e.attribs.content));

                    // Remove unwanted DOMs
                    const unwanted_element_selectors = [
                        '[class*="-advert"]',
                        '.social-share',
                        '.article-body-after',
                        'scmp-chinaR2-early-text',
                        '.newsletter-widget-wrapper',
                        '[id*="-tracker"]',
                        '[class^="advert-"]',
                        'amp-list',
                        '.more-on-this',
                    ];
                    unwanted_element_selectors.forEach((selector) => {
                        content.find(selector).each((_i, e) => {
                            $(e).remove();
                        });
                    });

                    return {
                        title: item.title,
                        id: item.guid,
                        pubDate: item.pubDate,
                        author: author.join(),
                        link: item.link,
                        summary: summary.html(),
                        description: content.html(),
                        icon: 'https://www.phoronix.com/android-chrome-192x192.png',
                        logo: 'https://www.phoronix.com/phxcms7-css/phoronix.png',
                    };
                })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
        icon: 'https://www.phoronix.com/android-chrome-192x192.png',
        logo: 'https://www.phoronix.com/phxcms7-css/phoronix.png',
        // Copied from thier web page metadata
        category: [
            'Linux Hardware Reviews',
            'Linux hardware benchmarks',
            'Linux Hardware',
            'Linux benchmarking',
            'Desktop Linux',
            'GNU/Linux benchmarks',
            'Open Source AMD',
            'Linux How To',
            'X.Org drivers',
            'Ubuntu hardware',
            'Phoronix Test Suite',
        ],
    };
};
