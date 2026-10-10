import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';

import { fetchSteamDiscussionPage, parseDiscussionListPage, parseDiscussionTopicPage, steamCommunityUrl } from './_discussion';

export const route: Route = {
    path: '/discussions/:appid/:feature?',
    name: 'Discussion List',
    url: 'steamcommunity.com',
    maintainers: ['NekoAria'],
    handler,
    example: '/steam/discussions/730',
    parameters: {
        appid: 'App ID, found in the Steam Community URL',
        feature: {
            description: 'App-local discussion subforum slot, found in the Steam Community URL',
            default: '0',
        },
    },
    description: `This new-topic feed enriches up to 15 topics from Steam's first, most-recently-active page with their full original posts and publication times. RSSHub sorts items by publication time by default; use \`?sorted=false\` to retain Steam's activity order. Recently created topics beyond that page may be missed. Pagination is not supported.`,
    categories: ['game'],
    features: {
        requirePuppeteer: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['steamcommunity.com/app/:appid/discussions'],
            target: '/discussions/:appid',
        },
        {
            source: ['steamcommunity.com/app/:appid/discussions/:feature'],
            target: '/discussions/:appid/:feature',
        },
        {
            source: ['steamcommunity.com/app/:appid/discussions/:feature/:topicId'],
            target: '/discussions/:appid/:feature',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { appid, feature } = ctx.req.param();
    const currentUrl = `${steamCommunityUrl}/app/${appid}/discussions/${feature ? `${feature}/` : ''}`;
    const page = parseDiscussionListPage(await fetchSteamDiscussionPage(currentUrl), currentUrl);

    const items = await Promise.all(page.topicLinks.map((link) => cache.tryGet(link, async () => parseDiscussionTopicPage(await fetchSteamDiscussionPage(link), link).originalPost)));

    return {
        title: `${page.appName} - ${page.forumName}`,
        link: currentUrl,
        item: items,
    };
}
