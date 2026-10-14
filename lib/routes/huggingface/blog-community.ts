import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog-community/:sort?',
    categories: ['programming'],
    example: '/huggingface/blog-community',
    parameters: {
        sort: {
            description: 'Sort by trending or recent',
            default: 'trending',
            options: [
                { value: 'trending', label: 'Trending' },
                { value: 'recent', label: 'Recent' },
            ],
        },
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
            source: ['huggingface.co/blog/community', 'huggingface.co/'],
        },
    ],
    name: 'Community Articles',
    maintainers: ['yuguorui'],
    handler,
    url: 'huggingface.co/blog/community',
};

interface AuthorData {
    _id?: string;
    avatarUrl: string;
    fullname: string;
    name: string;
    type: 'org' | 'user';
    isPro?: boolean;
    isHf: boolean;
    isHfAdmin: boolean;
    isMod: boolean;
    followerCount: number;
    isEnterprise?: boolean;
}

interface Post {
    _id: string;
    authorsData?: AuthorData[];
    canonical: boolean;
    isUpvotedByUser: boolean;
    numCoauthors: number;
    publishedAt: string;
    slug: string;
    status: string;
    title: string;
    upvotes: number;
    thumbnail?: string;
    url: string;
}

interface CommunityBlogApiResponse {
    posts: Post[];
    pagination: {
        numItemsPerPage: number;
        numTotalItems: number;
        pageIndex: number;
    };
}

function getPublicationDate(publishedAt: string | undefined) {
    const date = publishedAt ? parseDate(publishedAt) : undefined;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const { sort = 'trending' } = ctx.req.param();
    const { posts } = await ofetch<CommunityBlogApiResponse>(`https://huggingface.co/api/blog/community?sort=${sort}`);

    const lists = posts.map((item) => ({
        title: item.title,
        link: `https://huggingface.co${item.url}`,
        pubDate: getPublicationDate(item.publishedAt),
        author: item.authorsData?.[0]?.fullname || item.authorsData?.[0]?.name,
        upvotes: item.upvotes,
        image: item.thumbnail ? new URL(item.thumbnail, 'https://huggingface.co').href : undefined,
    }));

    const items: DataItem[] = await pMap(
        lists,
        async (item) => {
            const details = await cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const content = $('.blog-content > .relative.overflow-clip').first();
                if (!content.length) {
                    throw new Error(`HuggingFace article content was not found at ${item.link}`);
                }
                content.find('.absolute.not-prose').remove();
                return {
                    description: content.html(),
                };
            });
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Huggingface Community Articles',
        link: 'https://huggingface.co/blog/community',
        item: items,
    };
}
