const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    const rssUrl = tag ? `https://www.boston.com/tag/${tag}/?feed=atom` : `https://www.boston.com/?feed=atom`;
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const response = await got({
                        url: item.link,
                        method: 'get',
                    });
                    const html = response.body;
                    const $ = cheerio.load(html);
                    const content = $('div.content-text-article');

                    // Disable image lazyloading
                    content.find('img').each((i, e) => {
                        e = $(e);
                        e.attr('src', e.attr('srcset'));
                    });

                    // Categories
                    const categories = [];
                    $('meta[property="article:tag"]').each((i, e) => {
                        categories.push(e.attribs.content);
                    });

                    // Updated date
                    const updatedAt = $('meta[property="article:modified_time"]').attr().content;

                    // Summary
                    const summary = $('meta[property="og:description"]').attr().content;

                    // Remove unwanted DOMs
                    const unwanted_element_selectors = ['.ad-container', '.content-toaster--newsletter'];
                    unwanted_element_selectors.forEach((selector) => {
                        content.find(selector).each((i, e) => {
                            $(e).remove();
                        });
                    });

                    return {
                        title: item.title.trim(),
                        id: item.link,
                        pubDate: new Date(item.pubDate).toUTCString(),
                        updated: new Date(updatedAt).toUTCString(),
                        author: item.author.trim(),
                        link: item.link,
                        summary: summary.trim(),
                        description: content.html(),
                        category: categories,
                        icon: 'https://www.boston.com/wp-content/themes/bdc/images/favicons/largetile.png',
                        logo: 'https://www.boston.com/wp-content/themes/bdc/images/favicons/largetile.png',
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
        icon: 'https://www.boston.com/wp-content/themes/bdc/images/favicons/largetile.png',
        logo: 'https://www.boston.com/wp-content/themes/bdc/images/favicons/largetile.png',
    };
};
