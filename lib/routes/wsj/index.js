const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');

const categoryToXMLFileName = {
    opinion: 'RSSOpinion.xml',
    world_news: 'RSSWorldNews.xml',
    us_bussiness: 'WSJcomUSBusiness.xml',
    market_news: 'RSSMarketsMain.xml',
    technology: 'RSSWSJD.xml',
    lifestyle: 'RSSLifestyle.xml',
};

const categoryToName = {
    opinion: 'Opinion',
    world_news: 'World News',
    us_bussiness: 'U.S. Business',
    market_news: 'Markets News',
    technology: "Technology: What's News",
    lifestyle: 'Lifestyle',
};

module.exports = async (ctx) => {
    const language = ctx.params.lang;
    const category = ctx.params.category;
    let rssUrl;
    switch (language) {
        case 'en-us':
            rssUrl = `https://feeds.a.dj.com/rss/${categoryToXMLFileName[category]}`;
            break;
        case 'zh-cn':
            // Doesn't support categorical subscribtion
            rssUrl = `https://cn.wsj.com/zh-hans/rss/`;
            break;
        case 'zh-tw':
            rssUrl = `https://cn.wsj.com/zh-hant/rss/`;
            break;
        default:
            // Doesn't support other languages (e.g. ja) for now
            throw Error(`Language ${language} is not supported`);
    }

    const feed = await parser.parseURL(rssUrl);
    const chromeMobileUserAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36';

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                // Fetch the AMP version
                const url = item.link.replace(/(?<=^https:\/\/\w+\.wsj\.com)/, '/amp');
                const response = await got({
                    url,
                    method: 'get',
                    headers: {
                        'User-Agent': chromeMobileUserAgent,
                    },
                });
                const html = response.body;
                const $ = cheerio.load(html);
                const content = $('.articleBody > div[amp-access="access"]');

                // Cover
                const cover = $('.articleLead > div.is-lead-inset > div.header > .img-header > div.image-container > amp-img > img');

                if (cover.length > 0) {
                    $(`<img src=${cover[0].attribs.content}>`).insertBefore(content[0].childNodes[0]);
                    $(cover).remove();
                }

                // Summary
                const summary = $('head > meta[name="description"]').attr('content');

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
                    const iframe = $(`<iframe width="${e.attribs.width}" height="${e.attribs.height}" src="${e.attribs.src}">`);
                    $(iframe).insertBefore(e);
                    $(e).remove();
                });

                // Remove unwanted DOMs
                const unwanted_element_selectors = ['amp-ad', '.wsj-ad'];
                unwanted_element_selectors.forEach((selector) => {
                    content.find(selector).each((i, e) => {
                        $(e).remove();
                    });
                });

                // Paywall
                content.find('.paywall').each((i, e) => {
                    // Caption follows, no need to handle caption
                    $(e.childNodes).insertBefore(e);
                    $(e).remove();
                });

                return {
                    title: item.title,
                    id: item.guid,
                    pubDate: new Date(publishedAt).toUTCString(),
                    updated: new Date(updatedAt).toUTCString(),
                    author: item.creator,
                    link: item.link,
                    summary,
                    description: content.html(),
                    category: categories,
                    icon: 'https://s.wsj.net/media/wsj_launcher-icon-4x.png',
                    logo: 'https://vir.wsj.net/fp/assets/webpack4/img/wsj-logo-big-black.165e51cc.svg',
                };
            })
        )
    );

    ctx.state.data = {
        title: categoryToName[category],
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
        icon: 'https://s.wsj.net/media/wsj_launcher-icon-4x.png',
        logo: 'https://vir.wsj.net/fp/assets/webpack4/img/wsj-logo-big-black.165e51cc.svg',
    };
};
