import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 100);
    const baseUrl = 'https://windsurf.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;
    const response = await ofetch.raw<string>(targetUrl);
    const currentUrl = response.url;
    const $: CheerioAPI = load(response._data!);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const title: string = $('title').text();
    const currentEntries = $('div.update-container');
    if (!currentEntries.length) {
        throw new Error(`Changelog entries not found at ${currentUrl}`);
    }
    const items: DataItem[] = currentEntries
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const entry = $(element);
            const version = entry.find('[data-component-part=update-label]').text();
            const description = entry.find('[data-component-part=update-content]').html();
            const guid = `windsurf-${version}`;
            return {
                title: version,
                description,
                pubDate: parseDate(entry.find('[data-component-part=update-description]').text(), 'MMMM D, YYYY', 0),
                link: `${currentUrl}#${entry.attr('id')}`,
                guid,
                id: guid,
                language,
            };
        });
    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: currentUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};
export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'windsurf.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/windsurf/changelog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['windsurf.com/changelog'],
            target: '/changelog',
        },
        {
            source: ['docs.devin.ai/desktop/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
