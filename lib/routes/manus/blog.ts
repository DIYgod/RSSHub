import MarkdownIt from 'markdown-it';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

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
            source: ['www.manus.im'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Manus Blog',
    view: ViewType.Notifications,
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
        if (line.includes('{"blogList":{"$typeName"')) {
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
    }

    if (!blogList || !blogList.groups) {
        throw new Error('Failed to parse blogList from RSC data');
    }

    const list: Array<DataItem & { _contentUrl?: string }> = blogList.groups.flatMap(
        (group) =>
            group.blogs?.map((blog) => ({
                title: blog.title,
                link: `https://manus.im/blog/${blog.recordUid}`,
                pubDate: new Date(blog.createdAt.seconds * 1000),
                description: blog.desc,
                category: [group.kindName],
                _contentUrl: blog.contentUrl,
            })) ?? []
    );

    const items: DataItem[] = await Promise.all(
        list.map(
            (item) =>
                cache.tryGet(String(item.link), async () => {
                    const contentUrl = item._contentUrl;
                    let description = String(item.description);
                    if (contentUrl) {
                        try {
                            let contentText = await ofetch(contentUrl, { responseType: 'text' });
                            // Fix video embeds: Manus uses ![type=manus_video](url) which markdown-it renders as <img>
                            contentText = contentText.replaceAll(/!\[.*?\]\((.+?\.(mp4|mov|webm))\)/gi, '<video controls preload="metadata"><source src="$1"></video>');
                            // Parse markdown to HTML
                            description = md.render(contentText);
                        } catch {
                            // Fallback to description from list if fetch fails
                        }
                    }

                    // Remove the temporary property to avoid pollution
                    delete item._contentUrl;

                    return {
                        ...item,
                        description,
                    };
                }) as Promise<DataItem>
        )
    );

    return {
        title: 'Manus Blog',
        link: rootUrl,
        item: items,
        language: 'en',
    } satisfies Data;
}
