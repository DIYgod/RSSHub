import { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/devtrium',
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
            source: ['devtrium.com'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['Xy2002'],
    handler,
    url: 'devtrium.com',
};

async function handler() {
    const items = await fetchPage();

    return {
        title: 'Devtrium',
        language: 'en-us',
        item: items,
        link: 'https://devtrium.com',
    };
}

async function fetchPage() {
    const baseUrl = 'https://devtrium.com';
    const response = await ofetch(baseUrl);
    const $ = load(response, { scriptingEnabled: false });

    // Extract all posts of this page
    const data = JSON.parse($('script#__NEXT_DATA__').text());
    const items: DataItem[] = data.props.pageProps.posts.map((post) => ({
        title: post.title,
        link: `${baseUrl}/posts/${post.slug}`,
        description: post.description,
        pubDate: parseDate(post.date),
    }));
    return items;
}
