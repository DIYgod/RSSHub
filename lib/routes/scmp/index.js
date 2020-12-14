const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const UserAgent = require('user-agents');
const Puppeteer = require('@/utils/puppeteer');

async function getSeries(item) {
    const url = item.link;
    const browser = await Puppeteer();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    browser.close();

    const $ = cheerio.load(html);
    const content = $('.series-list__wrapper');

    const cover = $('.landing-banner__container')
        .attr('style')
        .match(/(?<=url\(").*(?=")/);
    if (cover.length > 0) {
        $(`<img src=${cover[0]}>`).insertBefore(content[0].childNodes[0]);
    }
    const summary = $('meta[property="og:description"]').attr('content');

    // Metadata (categories & updatedAt)
    const updatedAt = $('meta[property="article:modified_time"]').attr('content');
    const publishedAt = $('meta[property="article:published_time"]').attr('content');

    const categories = $('meta[name="keywords"]')
        .attr('content')
        .split(',')
        .map((c) => c.trim());

    // Remove unwanted DOMs
    const unwanted_element_selectors = [
        '[class*="-advert"]',
        '.social-share',
        '.article-body-after',
        'scmp-chinaR2-early-text',
        '.newsletter-widget-wrapper',
        '[id*="-tracker"]',
        '[class^="advert-"]',
        '.more-on-this',
        '[class*="-newsletter"]',
        '[class*="-ad"]',
    ];
    unwanted_element_selectors.forEach((selector) => {
        content.find(selector).each((_i, e) => {
            $(e).remove();
        });
    });

    return {
        title: item.title,
        id: item.guid,
        pubDate: new Date(publishedAt).toUTCString(),
        updated: new Date(updatedAt).toUTCString(),
        author: item.creator ? item.creator : 'SCMP',
        link: item.link,
        summary,
        description: content.html(),
        category: categories,
        icon: 'https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png',
        logo: 'https://customerservice.scmp.com/img/logo_scmp@2x.png',
    };
}

async function getArticle(item) {
    // Fetch the AMP version
    const url = item.link.replace(/^https:\/\/www\.scmp\.com/, 'https://amp.scmp.com');
    const chromeMobileUserAgent = new UserAgent([/Chrome/, { deviceCategory: 'mobile' }]).toString();
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
    content.find('amp-img').each((_i, e) => {
        const img = $(`<img width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}" alt="${e.attribs.alt}">`);

        // Caption follows, no need to handle caption
        $(img).insertBefore(e);
        $(e).remove();
    });

    // iframes (youtube videos and interactive elements)
    content.find('amp-iframe').each((_i, e) => {
        if ($(e).find('iframe').length > 0) {
            const iframe = $(e).find('iframe')[0];
            $(iframe).insertBefore(e);
            $(e).remove();
        }
    });

    content.find('div.video-wrapper > amp-iframe').each((_i, e) => {
        const iframe = $(`<iframe width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}">`);
        $(iframe).insertBefore(e);
        $(e).remove();
    });

    // Remove unwanted DOMs
    const unwanted_element_selectors = ['[class*="-advert"]', '.social-share', '.article-body-after', 'scmp-chinaR2-early-text', '.newsletter-widget-wrapper', '[id*="-tracker"]', '[class^="advert-"]', 'amp-list', '.more-on-this'];
    unwanted_element_selectors.forEach((selector) => {
        content.find(selector).each((_i, e) => {
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
}

module.exports = async (ctx) => {
    const categoryId = ctx.params.category_id;
    const rssUrl = `https://www.scmp.com/rss/${categoryId}/feed`;
    const feed = await parser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    if (item.link.includes('/series/')) {
                        return await getSeries(item);
                    } else {
                        return await getArticle(item);
                    }
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
