import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/thzt/blog',
    url: 'thzt.github.io',
    name: 'Blog',
    maintainers: ['jihuayu'],
    handler,
};

const author = '何幻';
const baseUrl = 'https://thzt.github.io';

async function getArticleDetails(link: string): Promise<Pick<DataItem, 'author' | 'pubDate' | 'description' | 'category'>> {
    const details = await cache.tryGet(link, async () => {
        const response = await got(`${baseUrl}/${link}`);
        const $ = load(response.data);
        const articlePubDate = $('meta[property="article:published_time"]').attr('content') || $('span.post-time > time').attr('datetime');
        return {
            author,
            pubDate: articlePubDate ? parseDate(articlePubDate) : undefined,
            description: $('div.post-body').html(),
            category: [$('span.post-category>span>a>span').first().text()],
        };
    });
    return { author: details.author, pubDate: details.pubDate, description: details.description, category: details.category };
}

async function handler() {
    const targetUrl = `${baseUrl}/archives/`;

    const response = await got({
        method: 'get',
        url: targetUrl,
    });
    const $ = load(response.data);

    const alist = $('a.post-title-link');
    const list = alist.toArray().map((item): DataItem => {
        const element = $(item);

        const link = element.attr('href') || '';
        const span = element.find('span').first();

        const title = span.text();

        return {
            title,
            link,
        };
    });
    const items = await pMap(list.slice(0, 15), async (item) => ({ ...item, ...(await getArticleDetails(item.link!)) }), { concurrency: 3 });

    return {
        title: 'thzt articles',
        link: targetUrl,
        item: items,
    };
}
