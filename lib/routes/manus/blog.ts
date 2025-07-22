import { Route, DataItem, Data, ViewType, Language } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { Context } from 'hono';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['programming'],
    example: '/manus/blog',
    url: 'manus.im',
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
            source: ['www.manus.im'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Manus Blog',
    view: ViewType.Notifications,
};

async function handler(ctx: Context) {
    const rootUrl = 'https://manus.im/blog';
    const lang: Language = (ctx.req.param('lang') ?? 'en') as Language;

    const response = await ofetch(rootUrl, {
        headers: {
            'Accept-Language': lang,
        },
    });
    const $ = load(response);

    const list: DataItem[] = $('div.mt-10.px-6 > a')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(String(element.attr('href')), rootUrl).href;
            const title = String(element.find('h2').attr('title'));

            return {
                link,
                title,
            };
        });

    const items: DataItem[] = await Promise.all(
        list.map((item) =>
            cache.tryGet(String(item.link), async () => {
                const response = await ofetch(String(item.link), {
                    headers: {
                        'Accept-Language': lang,
                    },
                });
                const $ = load(response);
                const description: string = $('div.relative:nth-child(3)').html() ?? '';
                const pubDateText: string = $('div.gap-3:nth-child(1) > span:nth-child(2)').text().trim();
                const currentYear: number = new Date().getFullYear();
                const pubDate: Date = new Date(`${pubDateText} ${currentYear}`);

                return {
                    ...item,
                    description,
                    pubDate,
                };
            })
        )
    );

    return {
        title: 'Manus',
        link: rootUrl,
        item: items,
        language: lang,
    } satisfies Data;
}
