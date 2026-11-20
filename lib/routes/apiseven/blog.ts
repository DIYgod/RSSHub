import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import MarkdownIt from '@/utils/markdown-it';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const md = MarkdownIt({
    html: true,
});

async function getArticles() {
    const url = 'https://www.apiseven.com/blog';
    const { data: res } = await got(url);
    const $ = load(res);
    const json = JSON.parse($('#__NEXT_DATA__').text());
    return json.props.pageProps.list.map((item) => ({
        title: item.title,
        link: 'https://www.apiseven.com' + item.slug,
        pubDate: parseDate(item.published_at, 8),
        category: item.tags,
    }));
}

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/apiseven/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '博客',
    maintainers: ['aneasystone'],
    handler,
};

async function handler(ctx) {
    const articles = await getArticles();
    const items = await Promise.all(
        articles.slice(0, getRouteLimit(ctx, 20)).map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: res } = await got(item.link);
                const $ = load(res);
                const json = JSON.parse($('#__NEXT_DATA__').text());
                return {
                    title: item.title,
                    description: md.render(json.props.pageProps.post.content),
                    link: item.link,
                    pubDate: item.pubDate,
                    category: item.category,
                    author: json.props.pageProps.post.author_name,
                };
            })
        )
    );

    return {
        title: '博客 | 支流科技',
        link: 'https://www.apiseven.com/blog',
        item: items,
    };
}
