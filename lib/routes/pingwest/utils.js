const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const statusListParser = ($) => {
    const items = $('.item')
        .map((_, ele) => {
            const timestamp = ele.attribs.pt;
            const $item = cheerio.load(ele);
            const mainNode = $item('.news-detail');
            const imgsStr = mainNode
                .find('img')
                .map((_, ele) => `<img src="${ele.attribs.src}"/>`)
                .get()
                .join('<br/>');
            const link = mainNode.find('.content a').first().attr('href');
            const content = mainNode
                .text()
                .trim()
                .replace(/展开全文$/, '');
            return {
                title: content,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: [content, imgsStr].filter((s) => !!s).join('<br/>'),
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();
    return items;
};

const articleListParser = ($, needFullText, cache) => {
    const items = $('.item')
        .map(async (_, ele) => {
            const $item = cheerio.load(ele);
            const titleNode = $item('.title').first();
            const title = titleNode.text();
            const prefixUlr = titleNode.find('a').attr('href');
            const link = prefixUlr.startsWith('http') ? prefixUlr : `https:${prefixUlr}`;
            const imgUrl = $item('.news-img img').attr('src');
            const author = $item('.author a').text();
            const timestamp = $item('.author .time').text();
            const date = /小时前/.test(timestamp) ? parseRelativeDate(timestamp) : parseDate(timestamp, ['YYYY M D', 'M D']);
            let description = $item('.desc').text();
            description += needFullText ? (await getFullArticle(link, cache)).description : `<br/><img src="${imgUrl}"/>`;

            return {
                title,
                link,
                description,
                author,
                pubDate: timezone(date, 8),
            };
        })
        .get();

    return items;
};

const wireListParser = ($) => {
    const items = $('.item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const timestamp = ele.attribs.pt;
            const titleNode = $item('.text').first();
            const title = titleNode.text();
            const link = titleNode.find('a').attr('href');
            return {
                title,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: title,
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        })
        .get();
    return items;
};

const getFullArticle = (link, cache) =>
    cache.tryGet(link, async () => {
        const { data } = await got(link);
        const $ = cheerio.load(data);
        const description = $('section.main .article-style').html();
        return {
            link,
            description,
        };
    });

module.exports = {
    articleListParser,
    statusListParser,
    wireListParser,
};
