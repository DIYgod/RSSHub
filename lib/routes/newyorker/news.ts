import { load } from 'cheerio';

import type { Route } from '@/types';
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
    maintainers: ['EthanWng97', 'pseudoyu'],
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
    const list = preloadedState.transformed.bundle.containers[0].items;
    const items = await Promise.all(
        list.map((item) => {
            const url = `${host}${item.url}`;
            return cache.tryGet(url, async () => {
                const data = await ofetch(url);
                const $ = load(data);
                const description = $('#main-content');
                description.find('h1').remove();
                description.find('.article-body__footer').remove();
                description.find('.social-icons').remove();
                description.find('div[class^="ActionBarWrapperContent-"]').remove();
                description.find('div[class^="ContentHeaderByline-"]').remove();
                return {
                    title: item.dangerousHed,
                    pubDate: item.pubDate,
                    link: url,
                    description: description.html(),
                };
            });
        })
    );

    return {
        title: `The New Yorker - ${category}`,
        link: host,
        description: 'Reporting, Profiles, breaking news, cultural coverage, podcasts, videos, and cartoons from The New Yorker.',
        item: items,
    };
}
