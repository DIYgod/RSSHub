import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.woshipm.com';

function parseArticleDate(value?: string) {
    if (!value || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)) {
        return;
    }
    const date = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? parseDate(value) : timezone(parseDate(value, value.includes('T') ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD', true), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
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
            .map((tag) => $(tag).text().trim())
            .filter(Boolean);
        return { description: $('.article--content').html(), pubDate: parseArticleDate(publishedAt), author: $('.author a.ui-captionStrong').text().trim() || undefined, category: category.length ? category : undefined };
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
