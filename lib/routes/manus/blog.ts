import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/manus/blog',
    url: 'manus.im',
    parameters: {},
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
            source: ['manus.im/', 'manus.im/blog', 'manus.im/blog/:slug'],
            target: '/blog',
        },
        {
            source: ['www.manus.im/', 'www.manus.im/blog', 'www.manus.im/blog/:slug'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Manus Blog',
    view: ViewType.Notifications,
};

const parseTimestamp = (timestamp?: { seconds?: string | number; nanos?: number }) => {
    const value = timestamp?.seconds;
    if (value === undefined || value === '') {
        return;
    }
    const seconds = Number(typeof value === 'string' && value.startsWith('$n') ? value.slice(2) : value);
    if (!Number.isFinite(seconds)) {
        return;
    }
    return parseDate(seconds * 1000 + Math.floor((timestamp?.nanos ?? 0) / 1_000_000));
};

async function handler() {
    const rootUrl = 'https://manus.im/blog';

    const renderData = await ofetch(rootUrl, {
        headers: {
            RSC: '1',
        },
        responseType: 'text',
    });

    let blogList;
    const lines = renderData.split('\n');
    for (const line of lines) {
        if (!line.includes('{"blogList":{"$typeName"')) {
            continue;
        }

        const jsonStr = line.slice(Math.max(0, line.indexOf('{"blogList":{"$typeName"')));
        const lastBrace = jsonStr.lastIndexOf('}');
        try {
            const parsed = JSON.parse(jsonStr.slice(0, Math.max(0, lastBrace + 1)));
            blogList = parsed.blogList;
            break;
        } catch {
            // Ignore parse errors and try next line if any
        }
    }

    if (!blogList || !blogList.groups) {
        throw new Error('Failed to parse blogList from RSC data');
    }

    const list: Array<DataItem & { _contentUrl?: string }> = blogList.groups.flatMap(
        (group) =>
            group.blogs?.map((blog) => ({
                title: blog.title,
                link: `https://manus.im/blog/${blog.recordUid}`,
                pubDate: parseTimestamp(blog.createdAt),
                description: blog.desc,
                category: [group.kindName],
                _contentUrl: blog.contentUrl,
            })) ?? []
    );

    const items: DataItem[] = await pMap(
        list,
        async ({ _contentUrl: contentUrl, ...item }) => {
            let description = item.description ?? '';
            if (typeof description !== 'string') {
                description = String(description);
            }
            if (contentUrl) {
                try {
                    const body = await cache.tryGet<{ description: string }>(`manus:article-body:v2:${item.link}`, async () => {
                        let contentText = await ofetch(contentUrl, { responseType: 'text' });
                        // Manus video embeds need a video element instead of an image.
                        contentText = contentText.replaceAll(/!\[.*?\]\((.+?\.(mp4|mov|webm))\)/gi, '<video controls preload="metadata"><source src="$1"></video>');
                        return { description: md.render(contentText) };
                    });
                    description = body.description;
                } catch {
                    // Keep the source's summary without caching a failed article request.
                }
            }
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Manus Blog',
        link: rootUrl,
        item: items,
        language: 'en',
    } satisfies Data;
}
