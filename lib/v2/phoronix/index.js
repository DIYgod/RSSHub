const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');

const baseUrl = 'https://www.phoronix.com';

module.exports = async (ctx) => {
    const { page, queryOrItem } = ctx.params;
    const rssUrl = new URL('/rss.php', baseUrl);
    rssUrl.searchParams.set('page', page);
    if (queryOrItem) {
        if (page === 'category') {
            rssUrl.searchParams.set('item', queryOrItem);
        } else {
            rssUrl.searchParams.set('q', queryOrItem);
        }
    }

    const feed = await parser.parseURL(rssUrl.toString());

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const html = response.body;
                const $ = cheerio.load(html);
                const content = $('.content');

                // Author
                const authorSelector = $('.author > a');
                // thel last 2 are the category and comments
                const author = authorSelector
                    .slice(0, authorSelector.length - 2)
                    .toArray()
                    .map((e) => $(e).text());

                // Maybe it's paginated
                const links = $('.pagination > a')
                    .toArray()
                    .map((pager) => `${baseUrl}${pager.attribs.href}`)
                    .slice(0, -1); // the last one is "next page"

                if (links.length) {
                    const pages = await Promise.all(
                        links.map((link) =>
                            ctx.cache.tryGet(link, async () => {
                                const response = await got(link);
                                const html = response.data;
                                const $$ = cheerio.load(html);
                                const page = $$('.content');
                                return page.html();
                            })
                        )
                    );
                    content.append(pages);
                }

                // Summary
                const summary = $('.content > p:nth-child(1)');

                // High res images
                content.find('img').each((_, img) => {
                    if (img.attribs.src.endsWith('_med')) {
                        img.attribs.src = img.attribs.src.replace('_med', '_show');
                    }
                });

                return {
                    title: item.title,
                    id: item.guid,
                    pubDate: item.pubDate,
                    author: author.join(', '),
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
        image: 'https://www.phoronix.com/android-chrome-192x192.png',
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
