import { load } from 'cheerio';

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
    authorsData: AuthorData[];
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

async function handler(ctx) {
    const { sort = 'trending' } = ctx.req.param();
    const response = await ofetch<CommunityBlogApiResponse>(`https://huggingface.co/api/blog/community?sort=${sort}`);

    const { posts } = response;

    const lists = posts.map((item) => ({
        title: item.title,
        link: `https://huggingface.co${item.url}`,
        pubDate: parseDate(item.publishedAt),
        author: item.authorsData?.[0]?.fullname || item.authorsData?.[0]?.name || 'Unknown',
        upvotes: item.upvotes,
        image: item.thumbnail ? new URL(item.thumbnail, 'https://huggingface.co').toString() : undefined,
    }));

    const items: DataItem[] = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                $('.mb-4, .mb-6, .not-prose, h1').remove();
                return {
                    ...item,
                    description: $('.blog-content').html() ?? undefined,
                };
            })
        )
    );

    return {
        title: 'Huggingface Community Articles',
        link: 'https://huggingface.co/blog/community',
        item: items,
    };
}
