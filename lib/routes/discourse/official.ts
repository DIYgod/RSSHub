import type { Data, Route } from '@/types';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { getPlaywrightPage } from '@/utils/playwright';
import RSSParser from '@/utils/rss-parser';

import { getConfig } from './utils';

export const route: Route = {
    path: '/:configId/official/:path{.+}',
    categories: ['bbs'],
    example: '/discourse/0/official/latest',
    parameters: {
        configId: 'Environment variable configuration id, see above',
        path: 'Discourse RSS path between `domain` and `.rss`. All supported Rss path can be found in [https://meta.discourse.org/t/finding-discourse-rss-feeds/264134](https://meta.discourse.org/t/finding-discourse-rss-feeds/264134). For example: the path of [https://meta.discourse.org/top/all.rss](https://meta.discourse.org/top/all.rss) is `top/all`.',
    },
    features: {
        requireConfig: [
            {
                name: 'DISCOURSE_CONFIG_*',
                description: 'Configure the Discourse environment variables referring to [https://docs.rsshub.app/deploy/config#discourse](https://docs.rsshub.app/deploy/config#discourse).',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Official RSS',
    maintainers: ['Raikyou', 'dzx-dzx'],
    handler,
};

const getResponseStatus = (error: unknown) => (error as { response?: { status?: number } })?.response?.status;

const fetchOfficialRssWithBrowser = async (url: string) => {
    const { destroy, page } = await getPlaywrightPage(url, {
        closeTimeout: 45_000,
        noGoto: true,
    });

    try {
        const response = await page.goto(url, {
            timeout: 30_000,
            waitUntil: 'domcontentloaded',
        });

        if (!response) {
            throw new Error(`Discourse browser mode returned no response for ${url}`);
        }

        if (!response.ok()) {
            throw new Error(`Discourse browser mode returned HTTP ${response.status()} for ${url}`);
        }

        return await response.text();
    } finally {
        await destroy();
    }
};

export const fetchOfficialRss = async (url: string, key?: string) => {
    try {
        return (
            await got(url, {
                headers: key
                    ? {
                          'User-Api-Key': key,
                      }
                    : undefined,
            })
        ).data;
    } catch (error) {
        if (getResponseStatus(error) !== 403) {
            throw error;
        }

        logger.warn(`[discourse/official] HTTP request returned 403, falling back to browser mode: ${url}`);

        try {
            return await fetchOfficialRssWithBrowser(url);
        } catch (browserError) {
            logger.warn(`[discourse/official] browser fallback failed for ${url}: ${browserError}`);
            throw error;
        }
    }
};

async function handler(ctx) {
    const { link, key } = getConfig(ctx) as unknown as { link: string; key?: string };
    const path = ctx.req.param('path');

    const url = `${link}/${path}.rss`;
    const feed = await RSSParser.parseString(await fetchOfficialRss(url, key));

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    return { item: feed.items, ...feed } as unknown as Data;
}
