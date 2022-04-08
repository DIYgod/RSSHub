/**
 * Author: @Rongronggg9
 *
 * There are at least three folders which are relevant with WeChat MP (Official Account Platform / Media Platform):
 * lib/route/tencent/wechat
 * lib/v2/wechat
 * lib/v2/gzh360
 *
 * If your new route is not in the above folders, please add it to the list.
 *
 * If your route need to fetch MP articles from mp.weixin.qq.com, you SHOULD use `finishArticleItem`.
 * However, if your route need to determine some metadata by itself, you MAY use `fetchArticle`.
 * If you find more metadata on the webpage, consider modifying `fetchArticle` to include them.
 * NEVER fetch MP articles from mp.weixin.qq.com in your route in order to avoid cache key collision.
 * NO NEED TO use cache if you are using `finishArticleItem` or `fetchArticle`, they will handle cache for you.
 *
 * If your route fetch MP articles from other websites, you SHOULD use `fixArticleContent` to fix the content format.
 * If you find more fixes that should be applied, consider modifying `fixArticleContent` to include them.
 *
 * For more details of these functions, please refer to the jsDoc in the source code.
 */

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const replaceTag = ($, oldTag, newTagName) => {
    oldTag = $(oldTag);
    const NewTag = $($(`<${newTagName} />`));
    const oldTagAttr = oldTag.attr();
    for (const key in oldTagAttr) {
        NewTag.attr(key, oldTagAttr[key]);
    }
    NewTag.append(oldTag.contents());
    oldTag.replaceWith(NewTag);
};

/**
 * Articles from WeChat MP have weird formats, this function is used to fix them.
 *
 * Even though your content are not directly fetched from WeChat MP, you SHOULD still call this function.
 * Calling this function is safe in most situations.
 *
 * Example usage: item.description = fixArticleContent($('div#js_content.rich_media_content'));
 * @param {*} html - The html to be fixed, a string or a cheerio object.
 * @param {boolean} skipImg - Whether to skip fixing images.
 * @return {string} - The fixed html, a string.
 */
const fixArticleContent = (html, skipImg = false) => {
    html = html && html.html ? html.html() : html; // do not disturb the original tree
    if (!html) {
        return '';
    }
    const $ = cheerio.load(html, undefined, false);
    if (!skipImg) {
        // fix img lazy loading
        $('img[data-src]').each((_, img) => {
            img = $(img);
            const realSrc = img.attr('data-src');
            if (realSrc) {
                img.attr('src', realSrc);
                img.removeAttr('data-src');
            }
        });
    }
    // fix section
    $('section').each((_, section) => {
        section = $(section);
        const p_count = section.find('p').length;
        const div_count = section.find('div').length;
        const section_count = section.find('section').length;
        if (p_count + div_count + section_count === 0) {
            // make it a p
            replaceTag($, section, 'p');
        } else {
            // make it a div
            replaceTag($, section, 'div');
        }
    });
    // clean scripts
    $('script').remove();
    return $.html();
};

/**
 * Fetch article and its metadata from WeChat MP (mp.weixin.qq.com).
 *
 * If you use this function, no need to call `fixArticleContent`
 * @param {object} ctx - The context object.
 * @param {string} url - The url of the article.
 * @param {boolean} bypassHostCheck - Whether to bypass host check.
 * @return {Promise<object>} - An object containing the article and its metadata.
 */
const fetchArticle = async (ctx, url, bypassHostCheck = false) => {
    const oriUrl = url;
    url = url.replace(/^http:\/\//, 'https://').replace(/#\w*$/, ''); // normalize url
    if (!bypassHostCheck && !url.startsWith('https://mp.weixin.qq.com/')) {
        throw new Error('wechat-mp: URL must start with https://mp.weixin.qq.com/ or http://mp.weixin.qq.com/, but got ' + oriUrl);
    }
    return await ctx.cache.tryGet(url, async () => {
        const response = await got(url);
        const $ = cheerio.load(response.data);

        const title = $('meta[property="og:title"]').attr('content');
        const author = $('meta[name=author]').attr('content');
        let summary = $('meta[name=description]').attr('content');
        summary = summary !== title ? summary : '';
        const description = fixArticleContent($('div#js_content.rich_media_content'));

        let pubDate;
        const publish_time_script = $('script[nonce][type="text/javascript"]:contains("var ct")').first().html();
        const publish_time_match = publish_time_script && publish_time_script.match(/var ct *= *"?(\d{10})"?/);
        const publish_timestamp = publish_time_match && publish_time_match[1];
        if (publish_timestamp) {
            pubDate = parseDate(publish_timestamp * 1000);
        }

        let mpName = $('.profile_nickname').first().text();
        mpName = mpName && mpName.trim();

        return { title, author, description, summary, pubDate, mpName, link: url };
    });
};

/**
 * Fetch article and its metadata from WeChat MP (mp.weixin.qq.com), then fill the `item` object with the result.
 *
 * If you use this function, no need to call `fetchArticle` or `fixArticleContent`
 *
 * A new route SHOULD use this function instead of manually calling the above functions
 *
 * An existing route adopting this function SHOULD either:
 * - set `skipLink` to true (not recommended)
 * - set `item.guid` to `item.link` BEFORE calling this function
 * @param {object} ctx - The context object.
 * @param {object} item - The item object to be filled.
 * @param {boolean} setMpNameAsAuthor - If `true`, `author` will be the MP itself, otherwise the real author of the article.
 * @param {boolean} skipLink - Whether to skip overriding `item.link` with the normalized url.
 * @return {Promise<object>} - The incoming `item` object, with the article and its metadata filled in.
 */
const finishArticleItem = async (ctx, item, setMpNameAsAuthor = false, skipLink = false) => {
    const { title, author, description, summary, pubDate, mpName, link } = await fetchArticle(ctx, item.link);
    item.title = title || item.title;
    item.description = description || item.description;
    item.summary = summary || item.summary;
    item.pubDate = pubDate || item.pubDate;
    if (setMpNameAsAuthor) {
        // the Official Account itself. if your route return articles from different accounts, you may want to use this
        item.author = mpName || item.author;
    } else {
        // the real author of the article. if your route return articles from a certain account, use this
        item.author = author || item.author;
    }
    if (!skipLink) {
        item.link = link || item.link;
    }
    return item;
};

module.exports = {
    fixArticleContent,
    fetchArticle,
    finishArticleItem, // a new route SHOULD use this function instead of manually calling the above functions
};
