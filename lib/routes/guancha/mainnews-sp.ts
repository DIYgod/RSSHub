import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.guancha.cn';
const currentUrl = `${rootUrl}/mainnews-sp/`;

type Item = {
    title: string;
    link: string;
    author?: string;
    pubDate?: Date;
    description?: string;
    category?: string[];
};

function normalizeLink(link?: string) {
    if (!link) {
        return;
    }

    return new URL(link.replace(/\.shtml$/, '_s.shtml'), rootUrl).href;
}

function parseListPubDate(text: string) {
    return text ? timezone(parseDate(text), +8) : undefined;
}

function dedupeItems(items: Item[]) {
    const links = new Set<string>();

    return items.filter((item) => {
        if (links.has(item.link)) {
            return false;
        }

        links.add(item.link);

        return true;
    });
}

function extractItems(html: string) {
    const $ = load(html);

    const featuredItems = $('.tsp-list1-title')
        .toArray()
        .map((item) => {
            const titleElement = $(item);
            const link = normalizeLink(titleElement.attr('href'));

            if (!link) {
                return;
            }

            return {
                title: titleElement.text(),
                link,
                author: titleElement.closest('.tsp-list1-box-type1').find('.tsp-list1-name').text() || undefined,
            };
        })
        .filter((item): item is NonNullable<typeof item> => !!item);

    const reviewItems = $('.tsp-list2-box')
        .toArray()
        .map((item) => {
            const itemElement = $(item);
            const titleElement = itemElement.find('.tsp-list2-title');
            const link = normalizeLink(titleElement.attr('href'));

            if (!link) {
                return;
            }

            return {
                title: titleElement.text(),
                link,
                author: itemElement.find('.tsp-list2-name').text() || undefined,
                pubDate: parseListPubDate(itemElement.find('.tsp-list2-review span').last().text()),
            };
        })
        .filter((item): item is NonNullable<typeof item> => !!item);

    return dedupeItems([...featuredItems, ...reviewItems]);
}

async function getArticle(item: Item) {
    let detailUrl = item.link;
    let detailResponse = await got({
        method: 'get',
        url: detailUrl,
    });

    const jumpMatch = detailResponse.data.match(/user\.guancha\.cn\/main\/content\?id=(.*)";/);

    if (jumpMatch !== null) {
        detailUrl = `https://user.guancha.cn/main/content?id=${jumpMatch[1]}&page=0`;
        detailResponse = await got({
            method: 'get',
            url: detailUrl,
        });
    }

    const $ = load(detailResponse.data);
    const dateMatch = detailResponse.data.match(/"pubDate":\s*"(.*)"/);
    $('[style]').removeAttr('style');
    const dateText = $('.time.fix span').first().text();
    const relativeDateText = $('.time1').text();
    const category = $('.key-word a')
        .toArray()
        .map((categoryItem) => $(categoryItem).text())
        .filter(Boolean);

    return {
        ...item,
        link: detailUrl,
        author: item.author || $('.author-intro p a').text() || $('.article-content div div h4 a').text() || $('.editor-intro p a').text() || $('.left-main > div.time.fix > span').eq(2).text() || undefined,
        pubDate: dateMatch ? timezone(parseDate(dateMatch[1]), +8) : dateText ? timezone(parseDate(dateText), +8) : relativeDateText ? parseRelativeDate(relativeDateText) : item.pubDate,
        description: $('.all-txt').html() || $('.article-txt-content').html() || item.description,
        category: category.length > 0 ? category : item.category,
    };
}

async function handler() {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = await Promise.all(extractItems(response.data).map((item) => cache.tryGet(item.link, () => getArticle(item))));

    return {
        title: '观察者网 - 时评',
        link: currentUrl,
        item: items,
    };
}

export const route: Route = {
    path: '/mainnews-sp',
    categories: ['new-media'],
    example: '/guancha/mainnews-sp',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['guancha.cn/mainnews-sp/'],
            target: '/mainnews-sp',
        },
    ],
    name: '时评',
    maintainers: ['nczitzk'],
    handler,
    url: 'guancha.cn/mainnews-sp/',
};
