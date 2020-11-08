const Parser = require('rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const rssUrl = `https://feeds.feedburner.com/chinafile/${category}`;

    // The custom UA in @/utils/parser (mimic browser) results in a HTML page
    // which cannot be parsed
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    let url = item.link;
                    const response = await got({ url });
                    const html = response.body;
                    const $ = cheerio.load(html);
                    const content = $('article');

                    // Cover
                    const cover = $('.view-featured-photo');

                    if (cover.length > 0) {
                        cover.insertBefore(content[0].childNodes[0]);
                        $(cover).remove();
                    }

                    // Summary
                    const summary = $('meta[name="description"]').attr('content');
                    const updatedAt = $('meta[name="og:updated_time"]').attr('content');

                    const categories = $('meta[name="news_keywords"]')
                        .attr('content')
                        .split(',')
                        .map((c) => c.trim());

                    url = $('link[rel="canonical"]').attr('href');

                    const pubDate = dayjs(`${item.pubDate.replace(' - ', ' ').replace('am', ' am').replace('pm', ' pm')}`).toISOString();

                    return {
                        title: item.title,
                        id: item.guid,
                        pubDate,
                        updated: updatedAt,
                        author: item.creator,
                        link: url,
                        summary,
                        description: content.html(),
                        category: categories,
                        icon: 'https://www.chinafile.com/sites/default/files/chinafile_favicon.png',
                        logo: 'https://www.chinafile.com/sites/all/themes/cftwo/assets/images/logos/logo-large.png',
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
        icon: 'https://www.chinafile.com/sites/default/files/chinafile_favicon.png',
        logo: 'https://www.chinafile.com/sites/all/themes/cftwo/assets/images/logos/logo-large.png',
    };
};
