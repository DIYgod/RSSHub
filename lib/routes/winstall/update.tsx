import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';

import { config } from '@/config';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const renderDesc = (installers?: string[]) =>
    renderToString(
        <>
            {installers?.map((installer) => (
                <>
                    <a href={installer}>{installer}</a>
                    <br />
                </>
            ))}
        </>
    );

async function getBuildId(baseUrl: string): Promise<string> {
    const { data } = await got(baseUrl);
    const $ = load(data);
    const buildId = JSON.parse($('#__NEXT_DATA__').text()).buildId;
    if (typeof buildId !== 'string' || !buildId) {
        throw new Error(`Application build ID missing at ${baseUrl}`);
    }
    return buildId;
}

export const route: Route = {
    path: '/:appId',
    categories: ['program-update'],
    example: '/winstall/Mozilla.Firefox',
    parameters: { appId: 'Application ID' },
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
            source: ['winstall.app/apps/:appId'],
        },
    ],
    name: 'Apps Update',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://winstall.app';
    const appId = ctx.req.param('appId');

    const buildId = await cache.tryGet('winget:buildId', () => getBuildId(baseUrl), config.cache.routeExpire, false);

    let response;
    try {
        ({ data: response } = await got(`${baseUrl}/_next/data/${buildId}/apps/${appId}.json`));
    } catch (error) {
        if (!(error instanceof FetchError) || error.response?.status !== 404) {
            throw error;
        }
        const currentBuildId = await getBuildId(baseUrl);
        if (currentBuildId === buildId) {
            throw error;
        }
        await cache.set('winget:buildId', JSON.stringify(currentBuildId), config.cache.routeExpire);
        ({ data: response } = await got(`${baseUrl}/_next/data/${currentBuildId}/apps/${appId}.json`));
    }
    const { app } = response.pageProps;
    const items = app.versions.map((item) => ({
        title: `${app.name} ${item.version}`,
        description: renderDesc(item.installers),
        author: app.publisher,
        category: app.tags,
        guid: `winstall:${appId}:${item.version}`,
    }));

    return {
        title: `${app.name} - winstall`,
        description: app.desc,
        link: `${baseUrl}/apps/${appId}`,
        image: `https://api.winstall.app/icons/next/${appId}.webp`,
        language: 'en' as const satisfies Language,
        item: items,
    };
}
