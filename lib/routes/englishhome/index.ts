import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/englishhome',
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
            source: ['englishhome.org/'],
        },
    ],
    name: '首頁',
    maintainers: ['johan456789'],
    handler,
    description: '英語之家 - The Home of English 首頁',
};

async function handler() {
    const rootUrl = 'https://englishhome.org';
    const apiUrl = `${rootUrl}/wp-json/wp/v2/posts?per_page=20&_embed=author,wp:term`;

    const data = await ofetch<any[]>(apiUrl);

    const items = data.map((post) => ({
        title: post.title?.rendered,
        description: post.content?.rendered ?? post.excerpt?.rendered ?? '',
        link: post.link,
        pubDate: parseDate(post.date_gmt ?? post.date),
        author: post._embedded?.author?.[0]?.name,
        category: Array.isArray(post._embedded?.['wp:term'])
            ? post._embedded['wp:term']
                  .flat()
                  .map((term: any) => term?.name)
                  .filter(Boolean)
            : undefined,
    }));

    return {
        title: '英語之家 - The Home of English',
        link: rootUrl,
        language: 'zh-TW',
        item: items,
    } as Data;
}
