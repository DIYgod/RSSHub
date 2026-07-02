import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface SpaceCardData {
    emoji?: string;
    license?: string;
    sdk?: string;
    title?: string;
}

interface SpaceItem {
    id: string;
    author?: string;
    cardData?: SpaceCardData;
    createdAt?: string;
    lastModified?: string;
    likes?: number;
    private?: boolean;
    sdk?: string;
    tags?: string[];
}

export const route: Route = {
    path: '/spaces/:query',
    categories: ['programming'],
    example: '/huggingface/spaces/rag',
    parameters: {
        query: 'Search keyword',
    },
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
            source: ['huggingface.co/spaces'],
        },
    ],
    name: 'Spaces Search',
    maintainers: ['JaggerH'],
    handler,
    url: 'huggingface.co/spaces',
};

async function handler(ctx) {
    const { query } = ctx.req.param();
    const link = `https://huggingface.co/spaces?search=${encodeURIComponent(query)}`;
    const searchParams = new URLSearchParams({
        search: query,
        sort: 'createdAt',
        direction: '-1',
        limit: '25',
        full: 'true',
    });

    const spaces = await ofetch<SpaceItem[]>(`https://huggingface.co/api/spaces?${searchParams.toString()}`);

    const items: DataItem[] = spaces.map((space) => {
        const itemLink = `https://huggingface.co/spaces/${space.id}`;
        const title = space.cardData?.title || space.id;
        const tags = space.tags ?? [];
        const sdk = space.cardData?.sdk || space.sdk;
        const metadata = [
            space.author ? `Author: ${space.author}` : undefined,
            sdk ? `SDK: ${sdk}` : undefined,
            typeof space.likes === 'number' ? `Likes: ${space.likes}` : undefined,
            space.lastModified ? `Last modified: ${space.lastModified}` : undefined,
            space.cardData?.license ? `License: ${space.cardData.license}` : undefined,
            tags.length ? `Tags: ${tags.join(', ')}` : undefined,
        ].filter(Boolean);

        return {
            title: space.cardData?.emoji ? `${space.cardData.emoji} ${title}` : title,
            link: itemLink,
            description: metadata.join('<br>'),
            author: space.author,
            category: tags,
            pubDate: space.createdAt ? parseDate(space.createdAt) : undefined,
            updated: space.lastModified ? parseDate(space.lastModified) : undefined,
        };
    });

    return {
        title: `Huggingface Spaces Search: ${query}`,
        link,
        item: items,
    };
}
