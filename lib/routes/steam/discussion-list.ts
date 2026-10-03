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
    description: `This best-effort new-topic feed enriches up to 15 topics from Steam's first, most-recently-active page with their full original posts and publication times when available. RSSHub sorts items by publication time by default; use \`?sorted=false\` to retain Steam's activity order. Recently created topics beyond that page may be missed. Pagination is not supported.`,
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
    isEnriched: boolean;
};

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
                    isEnriched: true,
                };
            } catch (error) {
                logger.warn(`steam/discussions: failed to enrich ${topic.link}: ${String(error)}`);
                return {
                    item: buildFallbackItem(topic),
                    isEnriched: false,
                };
            }
        },
        { concurrency: 3 }
    );

    if (resolvedTopics.length > 0 && resolvedTopics.every((topic) => !topic.isEnriched)) {
        throw new Error(`Steam returned no readable topic details for app ${appId}, feature ${feature}`);
    }

    return {
        title: `${page.appName} - ${page.forumName}`,
        link: currentUrl,
        item: resolvedTopics.map((topic) => topic.item),
    };
}
