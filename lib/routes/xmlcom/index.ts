import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const baseUrl = 'https://www.xml.com';
const feedUrl = `${baseUrl}/feed/all/`;

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/xmlcom',
    name: 'Articles and News',
    maintainers: ['AboutRSS'],
    radar: [
        {
            source: ['www.xml.com/'],
        },
    ],
    description:
        'The official Atom feed (/feed/all/) truncates every entry to a 128 character summary and carries no category tags. This route fetches the full body from each detail page and extracts the tags of that page into category.',
    handler,
};

async function handler(): Promise<Data> {
    // The feed is served as application/atom+xml, which ofetch would otherwise hand back as a Blob
    const feedXml = await ofetch(feedUrl, { responseType: 'text' });
    const feed = await parser.parseString(feedXml);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async (): Promise<DataItem> => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const $body = $('article.article > div.body');
                // 3 of the 20 entries currently in the feed carry an inline <style> block inside the body
                $body.find('style').remove();

                return {
                    title: item.title!,
                    link: item.link!,
                    author: item.author,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    description: $body.html(),
                    category: $('#tags a')
                        .toArray()
                        .map((tag) => $(tag).text()),
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: baseUrl,
        item: items,
    };
}
