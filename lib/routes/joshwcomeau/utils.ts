import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const rootUrl = 'https://www.joshwcomeau.com';

interface PostLink {
    url: string;
    cardTitle: string;
}

export async function getRelativeUrlList(url: string, selector: string) {
    const response = await ofetch<string>(url);
    const $ = load(response);
    const heading = $('header>h1').text();
    const urls = $(selector)
        .toArray()
        .map((element) => {
            const itemRelativeUrl = $(element).attr('href');
            const cardTitle = $(element).find('span').text();
            return { url: itemRelativeUrl, cardTitle };
        })
        .filter((item): item is PostLink => item.url !== undefined);
    return { heading, urls };
}

export async function processList(list: PostLink[]): Promise<DataItem[]> {
    return await pMap(list, (item) => cache.tryGet(`joshwcomeau:${item.url}`, () => getPostContent(item)), { concurrency: 3 });
}

async function getPostContent({ url, cardTitle }: PostLink): Promise<DataItem> {
    const articleUrl = new URL(url, rootUrl);
    if (articleUrl.origin !== new URL(rootUrl).origin) {
        return {
            title: cardTitle ?? 'External Content',
            description: 'Read it on external Site',
            link: articleUrl.href,
        };
    }
    const response = await ofetch<string>(articleUrl.href);
    const $ = load(response);
    const title = $('meta[property="og:title"]').attr('content')?.replace('• Josh W. Comeau', '');
    const author = $('meta[name="author"]').attr('content');
    const dateDiv = $('div[data-parent-layout]');
    const tag = dateDiv.find('dl:first-child > dd > a').text();
    const pubDate = dateDiv.find('dl:first-child > dd:has(span):not(:last-child)').text();
    const updateDate = dateDiv
        .find('dl')
        .filter((_, element) => $(element).find('dt').first().text() === 'Last updated')
        .find('dd:has(span):not(:last-child)')
        .text();
    const article = $('main > article');
    const description = article.html();
    return {
        title: title ?? cardTitle,
        description,
        author,
        pubDate: processDate(pubDate),
        updated: processDate(updateDate),
        link: articleUrl.href,
        content: { html: description, text: article.text() },
        category: [tag],
    };
}

function processDate(date: string) {
    const dateWithSlash = date.trim().replaceAll(' ', '/').replace(',', '');
    if (!dateWithSlash) {
        return;
    }
    const parsed = timezone(parseDate(dateWithSlash, 'MMMM/Do/YYYY', 'en'), 0);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
