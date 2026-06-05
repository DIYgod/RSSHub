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
    const headers = {
        Referer: 'https://tophub.today',
        Cookie: config.tophub?.cookie ?? '',
    };

    const rootUrl = 'https://tophub.today/';
    const link = new URL(`/n/${id}`, rootUrl).href;
    const response = await ofetch(rootUrl, {
        headers,
    });
    const $ = load(response);
    const container = $(`.i-o[hashid="${id}"]`).closest('.cc-cd');

    if (container.length === 0) {
        throw new Error(`TopHub list ${id} was not found on the homepage`);
    }

    const title = [container.find('.cc-cd-lb span').first().text().trim(), container.find('.cc-cd-sb-st').first().text().trim()].filter(Boolean).join(' - ');

    const out = await Promise.all(
        container
            .find('.cc-cd-cb-l > a')
            .toArray()
            .filter((element) => shouldIncludeItem($(element).find('.e').text().trim(), threshold))
            .map((e) => {
                const itemTitle = $(e).find('.t').text().trim();
                const itemLink = $(e).attr('href');
                const heatRate = $(e).find('.e').text().trim();

                return {
                    title: heatRate ? `${itemTitle} (${heatRate})` : itemTitle,
                    link: itemLink ? new URL(itemLink, rootUrl).href : link,
                };
            })
    );

    return {
        title,
        description: container.find('.i-h').first().text().trim(),
        image: container.find('.cc-cd-lb img').attr('src'),
        link,
        item: out,
    };
}

function shouldIncludeItem(heatRate: string, threshold: number) {
    if (threshold <= 0) {
        return true;
    }

    const hotness = parseHotness(heatRate);

    return !Number.isNaN(hotness) && hotness > threshold;
}

function parseHotness(heatRate: string) {
    const matched = heatRate.match(/([\d.]+)\s*(?:W|w|万)/);

    return matched ? Number.parseFloat(matched[1]) : Number.NaN;
}
