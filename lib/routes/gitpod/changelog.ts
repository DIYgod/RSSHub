import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/changelog',
    categories: ['programming'],
    example: '/gitpod/changelog',
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
            source: ['ona.com/docs/changelog', 'ona.com/', 'gitpod.io/changelog', 'gitpod.io/'],
        },
    ],
    name: 'Changelog',
    maintainers: ['TonyRL'],
    handler,
    url: 'ona.com/docs/changelog',
};

async function handler() {
    const link = `${rootUrl}/docs/changelog`;
    const [xml, html] = await Promise.all([ofetch(`${link}/rss.xml`, { responseType: 'text' }), ofetch(link, { responseType: 'text' })]);
    const feed = await parser.parseString(xml);
    const $ = load(html);
    const items = feed.items.map((item): DataItem => {
        const id = new URL(item.link!).hash.slice(1);
        const content = $(`[id="${id}"] [data-component-part="update-content"]`);
        if (!content.length) {
            throw new Error(`Ona changelog content was not found: ${item.link}`);
        }
        content.find('h2 > .absolute, h3 > .absolute').remove();
        content.find('[data-as="p"]').each((_, element) => {
            $(element).replaceWith($('<p>').html($(element).html() ?? ''));
        });
        return {
            title: item.title!,
            link: item.link,
            guid: item.guid,
            description: content.html() ?? undefined,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        };
    });

    return {
        title: feed.title!,
        link,
        description: feed.description,
        language: 'en-us' as const satisfies Language,
        item: items,
    };
}
