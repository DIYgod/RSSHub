import { DataItem } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const rootUrl = 'https://www.joshwcomeau.com';

export async function getRelativeUrlList(url, selector) {
    const response = await ofetch(url);
    const $ = load(response);
    const heading = $('header>h1').text();
    const urls = $(selector)
        .toArray()
        .map((element) => {
            const itemRelativeUrl = $(element).attr('href');
            const cardTitle = $(element).find('span').text();
            return { url: itemRelativeUrl as string, cardTitle };
        });
    return { heading, urls };
}

export async function processList(list) {
    const listPromise = await Promise.allSettled(list.map(async (item) => await cache.tryGet(`joshwcomeau:${item.url}`, async () => await getPostContent(item))));
    return listPromise.map((item, index) => (item.status === 'fulfilled' ? item.value : ({ title: 'Error Reading Item', link: `${rootUrl}${list[index]?.url}` } as DataItem)));
}

export async function getPostContent({ url, cardTitle }) {
    if (url.startsWith('https')) {
        return {
            title: cardTitle ?? 'External Content',
            description: 'Read it on external Site',
            link: url,
        } as DataItem;
    }
    const response = await ofetch(`${rootUrl}${url}`);
    const $ = load(response);
    const title = $('meta[property="og:title"]').attr('content')?.replace('• Josh W. Comeau', '');
    const summary = $('meta[property="og:description"]').attr('content');
    const author = $('meta[name="author"]').attr('content');
    const dateDiv = $('div[data-parent-layout]');
    const tag = dateDiv.find('dl:first-child > dd > a').text();
    const pubDate = dateDiv.find('dl:first-child > dd:has(span):not(:last-child)').text();
    const updateDate = dateDiv.find('dl:last-child > dd:has(span):not(:last-child)').text();
    const description = $('main > article').html();
    return {
        title,
        description,
        author,
        pubDate: processDate(pubDate),
        updated: processDate(updateDate),
        link: `${rootUrl}${url}`,
        content: { html: description, text: summary },
        category: [tag],
    } as DataItem;
}

function processDate(date: string) {
    const dateWithSlash = date.trim().replaceAll(' ', '/').replace(',', '');
    return parseDate(dateWithSlash, 'MMMM/Do/YYYY', 'en');
}
