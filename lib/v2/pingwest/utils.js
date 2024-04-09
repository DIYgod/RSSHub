const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const modifiedLink = (link) => (link.startsWith('http') ? link : `https:${link}`);

const statusListParser = ($) => {
    const items = $('.item')
        .toArray()
        .map((ele) => {
            const timestamp = ele.attribs.pt;
            const $item = cheerio.load(ele);
            const mainNode = $item('.news-detail');
            const imgsStr = mainNode
                .find('img')
                .toArray()
                .map((ele) => `<img src="${ele.attribs.src.split('?x-')[0]}">`)
                .join('<br>');
            const link = mainNode.find('.content a').first().attr('href');
            const content = mainNode
                .text()
                .trim()
                .replace(/展开全文$/, '');
            return {
                title: content,
                link: link.startsWith('http') ? link : `https:${link}`,
                description: [content, imgsStr].filter((s) => !!s).join('<br>'),
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        });
    return items;
};

const articleListParser = async ($, needFullText, cache) => {
    const items = await Promise.all(
        $('.item')
            .toArray()
            .map(async (ele) => {
                const $item = cheerio.load(ele);

                let titleNode, authorNode;
                if ($item('.news-detail').children().length <= 2) {
                    // newsflash
                    titleNode = $item('.news-detail .content .text');
                    authorNode = $item('.news-detail .content .op');
                } else {
                    // article
                    titleNode = $item('.news-detail .title');
                    authorNode = $item('.news-detail .author');
                }
                const title = titleNode.find('a').text();
                const prefixUrl = titleNode.find('a').attr('href');
                const link = modifiedLink(prefixUrl);
                const imgUrl = $item('.news-img img')?.attr('src')?.split('?x-')[0];
                const author = authorNode.children().first().text();
                const timestamp = authorNode.find('.time').text();
                const date = /小时前/.test(timestamp) ? parseRelativeDate(timestamp) : parseDate(timestamp, ['YYYY M D', 'M D']);
                let description = $item('.desc').text();
                const shortText = imgUrl ? `<br><img src="${imgUrl}">` : '';
                description += needFullText ? await getFullArticle(link, cache) : shortText;

                return {
                    title,
                    link,
                    description,
                    author,
                    pubDate: timezone(date, 8),
                };
            })
    );

    return items;
};

const getFullArticle = (link, cache) =>
    cache.tryGet(link, async () => {
        const { data } = await got(link);
        const $ = cheerio.load(data);
        $('img').each((_, ele) => {
            if (ele.attribs.src.includes('?x-')) {
                ele.attribs.src = ele.attribs.src.split('?x-')[0];
            }
        });
        const description = $('section .article-style').html();
        return description;
    });

module.exports = {
    articleListParser,
    statusListParser,
};
