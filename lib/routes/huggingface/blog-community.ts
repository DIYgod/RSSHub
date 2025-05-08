import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { load } from 'cheerio';
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

interface CommunityBlog {
    classNames: string;
    posts: Post[];
    pagination: Pagination;
    sort: string;
    showBackLink: boolean;
}

interface Pagination {
    numItemsPerPage: number;
    numTotalItems: number;
    pageIndex: number;
}

interface Post {
    _id: string;
    authorData: AuthorData;
    canonical: boolean;
    isUpvotedByUser: boolean;
    numCoauthors: number;
    publishedAt: string;
    slug: string;
    status: Status;
    title: string;
    upvotes: number;
}

interface AuthorData {
    _id?: string;
    avatarUrl: string;
    fullname: string;
    name: string;
    type: Type;
    isPro?: boolean;
    isHf: boolean;
    isHfAdmin: boolean;
    isMod: boolean;
    followerCount: number;
    isEnterprise?: boolean;
}

export enum Type {
    Org = 'org',
    User = 'user',
}

export enum Status {
    Published = 'published',
}

async function handler(ctx) {
    const { sort = 'trending' } = ctx.req.param();
    const { body: response } = await got(`https://huggingface.co/blog/community?sort=${sort}`);
    const $ = load(response);

    const data = $('div[data-target="CommunityBlogsContainer"]').attr('data-props');
    if (!data) {
        throw new Error('Failed to fetch data from Huggingface Community Articles');
    }
    const articles: CommunityBlog = JSON.parse(data);
    const lists = articles.posts.map((item) => ({
        title: item.title,
        link: `https://huggingface.co/blog/${item.authorData.name}/${item.slug}`,
        pubDate: parseDate(item.publishedAt),
        author: item.authorData.name,
    }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const { body: response } = await got(item.link);
                const $ = load(response);
                $('.mb-4, h1, .mb-6, .not-prose').remove();
                return {
                    ...item,
                    description: $('.blog-content').html(),
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
