import type { Context } from 'hono';
import pMap from 'p-map';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';

import { buildDiscussionListUrl, buildDiscussionTopicCacheKey, type DiscussionListTopic, fetchSteamDiscussionPage, parseAppId, parseDiscussionListPage, parseDiscussionTopicPage, parseFeature } from './_discussion';

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
    description: `This route enriches the 15 topics on Steam's first, most-recently-active page with their full original posts and original publication times, then sorts that sample by publication time. It is a best-effort new-topic feed: recently created topics that have already fallen beyond the first activity page may be missed. Pagination is not supported.`,
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

type ResolvedTopic = {
    item: DataItem;
    sourceIndex: number;
    isEnriched: boolean;
};

const getPublicationTime = (item: DataItem): number => (item.pubDate ? new Date(item.pubDate).getTime() : 0);

const buildFallbackItem = (topic: DiscussionListTopic): DataItem => ({
    title: topic.title,
    link: topic.link,
    guid: topic.link,
    ...(topic.authorName && {
        author: [{ name: topic.authorName }],
    }),
    ...(topic.preview && { description: topic.preview }),
});

async function handler(ctx: Context): Promise<Data> {
    const { appid: appIdParameter, feature: featureParameter } = ctx.req.param();
    const appId = parseAppId(appIdParameter);
    const feature = parseFeature(featureParameter);
    const currentUrl = buildDiscussionListUrl(appId, featureParameter === undefined ? undefined : feature);
    const page = parseDiscussionListPage(await fetchSteamDiscussionPage(currentUrl), { appId, feature });

    const resolvedTopics = await pMap(
        page.topics,
        async (topic): Promise<ResolvedTopic> => {
            const identity = {
                appId,
                feature,
                topicId: topic.topicId,
            };

            try {
                const item = await cache.tryGet(buildDiscussionTopicCacheKey(identity), async () => parseDiscussionTopicPage(await fetchSteamDiscussionPage(topic.link), identity).originalPost, config.cache.contentExpire, false);
                return {
                    item,
                    sourceIndex: topic.sourceIndex,
                    isEnriched: true,
                };
            } catch (error) {
                logger.warn(`steam/discussions: failed to enrich ${topic.link}: ${String(error)}`);
                return {
                    item: buildFallbackItem(topic),
                    sourceIndex: topic.sourceIndex,
                    isEnriched: false,
                };
            }
        },
        { concurrency: 3 }
    );

    if (resolvedTopics.length > 0 && resolvedTopics.every((topic) => !topic.isEnriched)) {
        throw new Error(`Steam returned no readable topic details for app ${appId}, feature ${feature}`);
    }

    const sortedTopics = resolvedTopics.toSorted((first, second) => {
        if (first.isEnriched !== second.isEnriched) {
            return first.isEnriched ? -1 : 1;
        }
        if (!first.isEnriched) {
            return first.sourceIndex - second.sourceIndex;
        }
        return getPublicationTime(second.item) - getPublicationTime(first.item);
    });

    return {
        title: `${page.appName} - ${page.forumName}`,
        link: currentUrl,
        item: sortedTopics.map((topic) => topic.item),
    };
}
