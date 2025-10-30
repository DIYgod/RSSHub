import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    name: 'ASR Articles',
    maintainers: ['HappyZhu99'],
    categories: ['journal'],
    path: '/journal/:journalID',
    parameters: {
        journalID: 'journal ID, can be found in the URL',
    },
    example: '/aiaa/journal/aiaaj',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('journalID');

    const baseUrl = 'https://arc.aiaa.org';
    const rssUrl = `${baseUrl}/action/showFeed?type=etoc&feed=rss&jc=${id}`;

    const pageResponse = await ofetch(rssUrl);

    const $ = load(pageResponse, {
        xml: {
            xmlMode: true,
        },
    });

    const channelTitle = $('title').first().text().replace(': Table of Contents', '');

    const imageUrl = $('image url').text();
    const items: DataItem[] = $('item')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const title = $item.find(String.raw`dc\:title`).text();
            const link = $item.find('link').text() || '';
            const description = $item.find('description').text() || '';
            const pubDate = parseDate($item.find(String.raw`dc\:date`).text() || '');
            const authors = $item
                .find(String.raw`dc\:creator`)
                .toArray()
                .map((authorElement) => $(authorElement).text());
            const author = authors.join(', ');

            return {
                title,
                link,
                description,
                pubDate,
                author,
            } satisfies DataItem;
        });

    return {
        title: `${channelTitle} | arc.aiaa.org`,
        description: 'List of articles from both the latest and ahead of print issues.',
        image: imageUrl,
        link: `${baseUrl}/journal/${id}`,
        item: items,
    };
}
