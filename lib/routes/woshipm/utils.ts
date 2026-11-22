import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://www.woshipm.com';

function parseArticleDate(value: string) {
    return parseDate(value, 8);
}

const fetchArticleDetails = (link: string) =>
    cache.tryGet(`${link}:article-tags`, async () => {
        const { data: response } = await got(link);
        const $ = load(response);
        $('.support-author').remove();
        const publishedAt = $('script[type="application/ld+json"]')
            .text()
            .match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
        const category = $('.taglist a[rel="tag"]')
            .toArray()
            .map((tag) => $(tag).text());
        return { description: $('.article--content').html(), pubDate: publishedAt ? parseArticleDate(publishedAt) : undefined, author: $('.author a.ui-captionStrong').text(), category: category.length ? category : undefined };
    });

const parseArticle = async <T extends Pick<DataItem, 'link'>>(item: T): Promise<T & Pick<DataItem, 'description' | 'category'>> => {
    const detail = await fetchArticleDetails(item.link!);
    return { ...item, description: detail.description, category: detail.category };
};

const parseUserArticle = async <T extends Pick<DataItem, 'link' | 'pubDate'>>(item: T) => {
    const detail = await fetchArticleDetails(item.link!);
    return { ...item, description: detail.description, pubDate: detail.pubDate ?? item.pubDate, author: detail.author, category: detail.category };
};

export { baseUrl, parseArticle, parseArticleDate, parseUserArticle };
