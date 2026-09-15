import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';

import { buildDiscussionTopicUrl, type DiscussionThreadPagination, fetchSteamDiscussionPage, parseAppId, parseDiscussionThreadPage, parseFeature, parseTopicId } from './_discussion';

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

const getPublicationTime = ({ pubDate }: DataItem): number => (pubDate ? new Date(pubDate).getTime() : 0);

const getPageCount = ({ replyCount, pageSize }: DiscussionThreadPagination): number => Math.max(1, Math.ceil(replyCount / pageSize));

const buildDiscussionThreadPageUrl = (topicUrl: string, pageNumber: number): string => {
    const pageUrl = new URL(topicUrl);
    pageUrl.searchParams.set('ctp', String(pageNumber));
    return pageUrl.href;
};

async function handler(ctx: Context): Promise<Data> {
    const { appid: appIdParameter, feature: featureParameter, topicId: topicIdParameter } = ctx.req.param();
    const identity = {
        appId: parseAppId(appIdParameter),
        feature: parseFeature(featureParameter),
        topicId: parseTopicId(topicIdParameter),
    };
    const currentUrl = buildDiscussionTopicUrl(identity);
    const firstPage = parseDiscussionThreadPage(await fetchSteamDiscussionPage(currentUrl), identity);
    const { pagination: firstPagePagination } = firstPage;
    if (firstPagePagination.start !== 0) {
        throw new Error(`Steam returned an unexpected first reply page for discussion topic ${identity.topicId}`);
    }

    const lastPageNumber = getPageCount(firstPagePagination);
    const repliesByGuid = new Map(firstPage.replies.map((reply) => [reply.guid, reply]));

    if (lastPageNumber > 1) {
        const lastPageUrl = buildDiscussionThreadPageUrl(currentUrl, lastPageNumber);
        const lastPage = parseDiscussionThreadPage(await fetchSteamDiscussionPage(lastPageUrl), identity);
        const { pagination: lastPagePagination } = lastPage;
        const expectedStart = (lastPageNumber - 1) * firstPagePagination.pageSize;
        const hasExpectedPagination = lastPagePagination.pageSize === firstPagePagination.pageSize && lastPagePagination.start === expectedStart && getPageCount(lastPagePagination) === lastPageNumber;

        if (!hasExpectedPagination) {
            throw new Error(`Steam discussion topic ${identity.topicId} changed while loading its last reply page; retry the request`);
        }

        for (const reply of lastPage.replies) {
            repliesByGuid.set(reply.guid, reply);
        }
    }

    const sortedItems = [firstPage.originalPost, ...repliesByGuid.values()].toSorted((first, second) => getPublicationTime(second) - getPublicationTime(first));

    return {
        title: `${firstPage.title} - ${firstPage.appName}`,
        link: currentUrl,
        item: sortedItems,
    };
}
