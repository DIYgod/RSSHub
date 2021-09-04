const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const categoryId = ctx.params.category_id;
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const feed = await parser.parseURL(rssUrl);
    const chromeMobileUserAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36';

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    // Fetch the AMP version
                    const url = item.link.replace(/^https:\/\/www\.scmp\.com/, 'https://amp.scmp.com');
                    const response = await got({
                        url,
                        method: 'get',
                        headers: {
                            'User-Agent': chromeMobileUserAgent,
                        },
                    });
                    const html = response.body;
                    const $ = cheerio.load(html);
                    const content = $('div.article-body.clearfix');

                    // Cover
                    const cover = $('.article-images > amp-carousel > .i-amphtml-slides-container >.i-amphtml-slide-item > amp-img > img');

                    if (cover.length > 0) {
                        $(`<img src=${cover[0].attribs.content}>`).insertBefore(content[0].childNodes[0]);
                        $(cover).remove();
                    }

                    // Summary
                    const summary = $('div.article-header__subhead > ul');

                    // Metadata (categories & updatedAt)
                    const updatedAt = $('meta[itemprop="dateModified"]').attr('content');
                    const publishedAt = $('meta[itemprop="datePublished"]').attr('content');

                    const categories = $('meta[name="keywords"]')
                        .attr('content')
                        .split(',')
                        .map((c) => c.trim());

                    // Images
                    content.find('amp-img').each((i, e) => {
                        const img = $(`<img width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}" alt="${e.attribs.alt}">`);

                        // Caption follows, no need to handle caption
                        $(img).insertBefore(e);
                        $(e).remove();
                    });

                    // iframes (youtube videos and interactive elements)
                    content.find('amp-iframe').each((i, e) => {
                        if ($(e).find('iframe').length > 0) {
                            const iframe = $(e).find('iframe')[0];
                            $(iframe).insertBefore(e);
                            $(e).remove();
                        }
                    });

                    content.find('div.video-wrapper > amp-iframe').each((i, e) => {
                        const iframe = $(`<iframe width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}">`);
                        $(iframe).insertBefore(e);
                        $(e).remove();
                    });

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
                        content.find(selector).each((i, e) => {
                            $(e).remove();
                        });
                    });

                    return {
                        title: item.title,
                        id: item.guid,
                        pubDate: new Date(publishedAt).toUTCString(),
                        updated: new Date(updatedAt).toUTCString(),
                        author: item.creator,
                        link: item.link,
                        summary: summary.html(),
                        description: content.html(),
                        category: categories,
                        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
                        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
                    };
                })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en-hk',
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
    };
};
