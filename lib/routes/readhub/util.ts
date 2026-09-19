import { z } from 'zod';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const domain = 'readhub.cn';
const rootUrl = `https://${domain}`;
const apiRootUrl = `https://api.${domain}`;
const apiTopicUrl = new URL('topic/list', apiRootUrl).href;
const apiDetailUrl = new URL('topic/detail', apiRootUrl).href;
const apiTimelineUrl = new URL('topic/timeline/list', apiRootUrl).href;

const namedEntry = z.object({ name: z.string() });
const newsSchema = z.object({ url: z.url(), title: z.string(), siteNameDisplay: z.string().nullish() });
const topicSchema = z.object({
    uid: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    url: z.url().nullish(),
    publishDate: z.iso.datetime({ offset: true }),
    siteNameDisplay: z.string().nullish(),
    newsAggList: z.array(newsSchema),
    entityList: z.array(namedEntry).nullish(),
    tagList: z.array(namedEntry).nullish(),
});
const timelineEntrySchema = z.object({ uid: z.string().min(1), title: z.string(), publishDate: z.iso.datetime({ offset: true }).nullish() });
const timelineDataSchema = z.object({ items: z.array(timelineEntrySchema) });
const topicDataSchema = z.object({ items: z.array(topicSchema) });
const timelineSchema = z.object({ data: timelineDataSchema });
const detailSchema = z.object({ data: topicDataSchema });

type ReadhubItem = DataItem & { link: string; guid: string };

async function fetchTopic(uid: string): Promise<ReadhubItem> {
    const { data: detailResponse } = await got(apiDetailUrl, { searchParams: { uid } });
    const detail = detailSchema.safeParse(detailResponse);
    if (!detail.success) {
        throw new Error('Readhub topic detail response is invalid or missing publication dates');
    }
    const matches = detail.data.data.items.filter((topic) => topic.uid === uid);
    if (matches.length !== 1) {
        throw new Error('Readhub topic detail response does not contain the requested topic');
    }
    const topic = matches[0];

    const { data: timelineResponse } = await got(apiTimelineUrl, { searchParams: { topic_uid: uid, size: 10 } });
    const timeline = timelineSchema.safeParse(timelineResponse);
    if (!timeline.success) {
        throw new Error('Readhub topic timeline response is invalid');
    }

    return {
        title: topic.title,
        link: topic.url ?? new URL(`topic/${topic.uid}`, rootUrl).href,
        description: renderDescription({
            description: topic.summary,
            news: topic.newsAggList.map((news) => ({ ...news, siteNameDisplay: news.siteNameDisplay ?? undefined })),
            timeline: { topics: timeline.data.data.items.map((entry) => ({ ...entry, publishDate: entry.publishDate ?? undefined })) },
            rootUrl,
        }),
        author: topic.siteNameDisplay ?? undefined,
        category: [...(topic.entityList ?? []), ...(topic.tagList ?? [])].map((entry) => entry.name),
        guid: `readhub-${topic.uid}`,
        pubDate: parseDate(topic.publishDate),
    };
}

const processItems = (items: ReadhubItem[]): Promise<ReadhubItem[]> =>
    Promise.all(
        items.map((item) => {
            const url = new URL(item.link);
            const topicPath = /^\/topic\/([^/]+)\/?$/.exec(url.pathname);
            if (url.origin !== rootUrl || !topicPath) {
                return { ...item, guid: `readhub-${item.guid}` };
            }

            // Keep failed enrichment out of the cache, including old summary-only entries.
            const uid = decodeURIComponent(topicPath[1]);
            return cache.tryGet(`readhub:topic:v2:${uid}`, () => fetchTopic(uid));
        })
    );

export { apiRootUrl, apiTopicUrl, processItems, rootUrl };
