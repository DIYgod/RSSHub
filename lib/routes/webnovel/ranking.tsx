import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

const rankings = {
    power: 'bi_annual/power_rank',
    trending: 'bi_annual/best_sellers',
    collect: 'all_time/collection_rank',
    popular: 'all_time/popular_rank',
    update: 'all_time/update_rank',
    active: 'all_time/engagement_rank',
    fandom: 'all_time/fandom_rank',
};

export const route: Route = {
    path: '/ranking/:type?',
    categories: ['reading'],
    example: '/webnovel/ranking',
    parameters: {
        type: {
            description: 'Novel ranking type.',
            default: 'power',
            options: Object.keys(rankings).map((value) => ({ value, label: value })),
        },
    },
    name: 'Novel rankings',
    maintainers: ['DIYgod'],
    radar: [{ source: ['webnovel.com/ranking'], target: '/ranking' }],
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
};

async function fetchRanking(link: string) {
    const { page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        gotoConfig: { waitUntil: 'domcontentloaded', timeout: 20000 },
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('.j_rank_wrapper section', { state: 'attached', timeout: 15000 });
        return await page.content();
    } finally {
        await destroy();
    }
}

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'power';
    if (!Object.hasOwn(rankings, type)) {
        throw new InvalidParameterError(`Unknown ranking. Supported types: ${Object.keys(rankings).join(', ')}.`);
    }
    const link = `https://www.webnovel.com/ranking/novel/${rankings[type]}`;
    const response = await fetchRanking(link);
    const $ = load(response);
    return {
        title: `WebNovel - ${type} ranking`,
        link,
        item: $('.j_rank_wrapper section')
            .toArray()
            .map((element) => {
                const book = $(element);
                const title = book.find('h3 a');
                return {
                    title: title.text(),
                    link: new URL(title.attr('href')!, link).href,
                    author: book.find('strong.c_l').text(),
                    category: book
                        .find('a[href^="/tags/"], a[href^="/stories/"]')
                        .toArray()
                        .map((tag) => $(tag).attr('title') ?? $(tag).text()),
                    description: renderToString(
                        <>
                            <img src={book.find('img').attr('data-original')} alt="" />
                            <p>{title.closest('h3').next('p').text()}</p>
                        </>
                    ),
                };
            }),
    };
}
