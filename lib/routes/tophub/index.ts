import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:id/:threshold?',
    categories: ['new-media'],
    example: '/tophub/Om4ejxvxEN',
    parameters: {
        id: '榜单id，可在 URL 中找到',
        threshold: '可选热度阈值，仅保留热度数值大于该值且以“万”为单位的条目',
    },
    features: {
        requireConfig: [
            {
                name: 'TOPHUB_COOKIE',
                optional: true,
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tophub.today/n/:id'],
        },
    ],
    name: '榜单',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const threshold = Number.parseFloat(ctx.req.param('threshold')) || 0;
    const heatRatePattern = /[\d.]+\s*万.*/;
    const headers = {
        Referer: 'https://tophub.today',
        Cookie: config.tophub?.cookie ?? '',
    };

    const link = `https://tophub.today/n/${id}`;
    const response = await ofetch(link, {
        headers,
    });
    const $ = load(response);

    const title = $('.tt h3').text().trim();

    const out = await Promise.all(
        $('.rank-all-item:not(.history-content) .jc-c tr')
            .toArray()
            .filter((e) => {
                const heatRate = $(e).find('td:nth-child(3)').text().trim();
                const hotness = Number.parseFloat(heatRate);

                return heatRatePattern.test(heatRate) && (Number.isNaN(hotness) || hotness > threshold);
            })
            .map(async (e) => {
                const title = $(e).find('td a').first().text().trim();
                const itemLink = $(e).find('td a').first().attr('href');
                const heatRate = $(e).find('td:nth-child(3)').text().trim();
                const redirectResponse = await ofetch.raw(new URL(itemLink, link).href, {
                    headers,
                });

                return {
                    title: `${title} (${heatRate})`,
                    link: redirectResponse.url,
                    description: $(e).find('.ws').text().trim(),
                };
            })
    );

    return {
        title,
        description: $('.tt p').text().trim(),
        image: $('.ii img').attr('src'),
        link,
        item: out,
    };
}
