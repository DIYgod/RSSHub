import type { Context } from 'hono';

import type { Data, Route } from '@/types';

import { fetchSteamDiscussionPage, parseDiscussionTopicPage, steamCommunityUrl } from './_discussion';

export const route: Route = {
    path: '/discussion/:appid/:feature/:topicId',
    name: 'Discussion Thread',
    url: 'steamcommunity.com',
    maintainers: ['NekoAria'],
    handler,
    example: '/steam/discussion/730/0/563667940587817948',
    parameters: {
        appid: 'App ID, found in the Steam Community URL',
        feature: 'App-local discussion subforum slot, found in the Steam Community URL',
        topicId: 'Discussion topic ID, found in the Steam Community URL',
    },
    description: 'This route contains the original post and up to 15 replies from each of the first and current last pages. Replies on intervening pages are not included, and pagination is not supported.',
    categories: ['game'],
    features: {
        requirePuppeteer: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['steamcommunity.com/app/:appid/discussions/:feature/:topicId'],
            target: '/discussion/:appid/:feature/:topicId',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { appid, feature, topicId } = ctx.req.param();
    const currentUrl = `${steamCommunityUrl}/app/${appid}/discussions/${feature}/${topicId}/`;
    const firstPage = parseDiscussionTopicPage(await fetchSteamDiscussionPage(currentUrl), currentUrl);
    const items = [firstPage.originalPost, ...firstPage.replies];

    const lastPageNumber = Math.ceil(firstPage.replyCount / 15);
    if (lastPageNumber > 1) {
        const lastPage = parseDiscussionTopicPage(await fetchSteamDiscussionPage(`${currentUrl}?ctp=${lastPageNumber}`), currentUrl);
        items.push(...lastPage.replies);
    }

    return {
        title: `${firstPage.title} - ${firstPage.appName}`,
        link: currentUrl,
        item: items,
    };
}
