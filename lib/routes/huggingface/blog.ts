import { Route, type DataItem } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/huggingface/blog',
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
            source: ['huggingface.co/blog', 'huggingface.co/'],
        },
    ],
    name: '英文博客',
    maintainers: ['cesaryuan', 'zcf0508'],
    handler,
    url: 'huggingface.co/blog',
};

interface Author {
    user: string;
    guest: boolean;
    org?: string;
}

interface Blog {
    authors: Author[];
    canonical: boolean;
    isUpvotedByUser: boolean;
    publishedAt: string;
    slug: string;
    title: string;
    upvotes: number;
    thumbnail: string;
    guest: boolean;
}

interface BlogData {
    blog: Blog;
    blogUrl: string;
    lang: string;
    loggedInUser: string;
}

async function handler() {
    const { body: response } = await got('https://huggingface.co/blog');
    const $ = load(response);

    /** @type {Array<{blog: {local: string, title: string, author: string, thumbnail: string, date: string, tags: Array<string>}, blogUrl: string, lang: 'zh', link: string}>} */
    const papers = $('div[data-target="BlogThumbnail"]')
        .toArray()
        .map((item) => {
            const props = $(item).data('props') as BlogData;
            const link = $(item).find('a').attr('href');
            return {
                ...props,
                link,
            };
        });

    const items: DataItem[] = papers.map((item) => ({
        title: item.blog.title,
        link: `https://huggingface.co${item.link}`,
        pubDate: parseDate(item.blog.publishedAt),
        author: item.blog.authors.map((author) => ({
            name: author.user,
        })),
        upvotes: item.blog.upvotes,
        image: new URL(item.blog.thumbnail, 'https://huggingface.co').toString(),
    }));

    return {
        title: 'Huggingface 英文博客',
        link: 'https://huggingface.co/blog',
        item: items,
    };
}
