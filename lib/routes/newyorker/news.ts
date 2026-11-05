import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const host = 'https://www.newyorker.com';
export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/newyorker/latest',
    parameters: { category: 'tab name. can be found at url' },
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
            source: ['newyorker.com/:category?'],
        },
    ],
    name: 'Articles',
    maintainers: ['IvanWng97', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { category } = ctx.req.param();
    const link = `${host}/${category}`;
    const response = await ofetch(link);
    const $ = load(response);
    const preloadedState = JSON.parse(
        $('script:contains("window.__PRELOADED_STATE__")')
            .text()
            .match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? '{}'
    );
    const list: Array<{ url: string; dangerousHed: string; pubDate?: DataItem['pubDate'] }> = preloadedState.transformed.bundle.containers[0].items;
    const items = await pMap(
        list,
        async (item) => {
            const url = `${host}${item.url}`;
            const details = await cache.tryGet(`${url}:article-body:authors`, async () => {
                const data = await ofetch(url);
                const $ = load(data);
                const metadata: { author?: Array<{ name?: string; sameAs?: string }> } = JSON.parse($('script[type="application/ld+json"]').first().text() || '{}');
                const author = metadata.author?.flatMap((author) => (author.name ? [{ name: author.name, url: author.sameAs || undefined }] : []));
                const description = $('#main-content');
                description.find('h1').remove();
                description.find('.article-body__footer').remove();
                description.find('.social-icons').remove();
                description.find('div[class^="ActionBarWrapperContent-"]').remove();
                description.find('div[class^="ContentHeaderByline-"]').remove();
                return {
                    description: description.html(),
                    author: author?.length ? author : undefined,
                };
            });
            return { title: item.dangerousHed, pubDate: item.pubDate, link: url, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `The New Yorker - ${category}`,
        link: host,
        description: 'Reporting, Profiles, breaking news, cultural coverage, podcasts, videos, and cartoons from The New Yorker.',
        item: items,
    };
}
