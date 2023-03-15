const asyncPool = require('tiny-async-pool');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'android', device: 'mobile' });

// const chromeMobileUserAgent = 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36';
const parseArticle = (item, ctx) =>
    ctx.cache.tryGet(item.link, async () => {
        // Fetch the AMP version
        const url = item.link.replace(/(?<=^https:\/\/\w+\.wsj\.com)/, '/amp');
        const response = await got({
            url,
            method: 'get',
            headers: {
                'User-Agent': UA,
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const content = $('.articleBody > section');

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
        const author = $('.author > a[rel="author"]').text();

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
            pubDate: parseDate(publishedAt),
            updated: parseDate(updatedAt),
            author,
            link: item.link,
            summary,
            description: content.html(),
            category: categories,
            icon: 'https://s.wsj.net/media/wsj_launcher-icon-4x.png',
            logo: 'https://vir.wsj.net/fp/assets/webpack4/img/wsj-logo-big-black.165e51cc.svg',
        };
    });

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};
module.exports = {
    asyncPoolAll,
    parseArticle,
};
