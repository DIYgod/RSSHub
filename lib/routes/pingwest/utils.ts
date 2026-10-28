import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const modifiedLink = (link: string) => new URL(link, 'https://www.pingwest.com').href;

const statusListParser = ($) => {
    const items = $('.item')
        .toArray()
        .map((ele) => {
            const timestamp = ele.attribs.pt;
            const $item = $(ele);
            const mainNode = $item.find('.news-detail');
            const imgsStr = mainNode
                .find('img')
                .toArray()
                .map((ele) => `<img src="${ele.attribs.src.split('?x-', 1)[0]}">`)
                .join('<br>');
            const link = mainNode.find('.content a').first().attr('href');
            const content = mainNode
                .text()
                .trim()
                .replace(/展开全文$/, '');
            return {
                title: content,
                link: modifiedLink(link),
                description: [content, imgsStr].filter((s) => !!s).join('<br>'),
                pubDate: new Date(timestamp * 1000).toUTCString(),
            };
        });
    return items;
};

const articleListParser = async ($: CheerioAPI, needFullText, cache) => {
    const items = await pMap(
        $('.item').toArray(),
        async (ele) => {
            const $item = $(ele);

            let titleNode, authorNode;
            if ($item.find('.news-detail').children().length <= 2) {
                // newsflash
                titleNode = $item.find('.news-detail .content .text');
                authorNode = $item.find('.news-detail .content .op');
            } else {
                // article
                titleNode = $item.find('.news-detail .title');
                authorNode = $item.find('.news-detail .author');
            }
            const title = titleNode.find('a').text();
            const prefixUrl = titleNode.find('a').attr('href');
            if (!prefixUrl) {
                throw new Error('The article card does not contain a link.');
            }
            const link = modifiedLink(prefixUrl);
            const imgUrl = $item.find('.news-img img')?.attr('src')?.split('?x-', 1)[0];
            const author = authorNode.children().first().text();
            const timestamp = authorNode.find('.time').text();
            const isRelativeDate = /小时前/.test(timestamp);
            const date = isRelativeDate ? parseRelativeDate(timestamp) : parseDate(timestamp, ['YYYY M D', 'M D']);
            let description = $item.find('.desc').text();
            const shortText = imgUrl ? `<br><img src="${imgUrl}">` : '';
            description = needFullText ? ((await getFullArticle(link, cache)) ?? description) : description + shortText;

            return {
                title,
                link,
                description,
                author,
                category: $item
                    .find('.item-tag-list .tag span')
                    .toArray()
                    .map((tag) => $(tag).text()),
                pubDate: isRelativeDate ? date : timezone(date, 8),
            };
        },
        { concurrency: 3 }
    );

    return items;
};

const getFullArticle = (link, cache) =>
    cache.tryGet(link, async () => {
        const { data } = await got(link);
        const $ = load(data);
        $('img').each((_, ele) => {
            if (ele.attribs.src.includes('?x-')) {
                ele.attribs.src = ele.attribs.src.split('?x-', 1)[0];
            }
        });
        const description = $('section .article-style').html();
        return description;
    });

export default { articleListParser, statusListParser };
