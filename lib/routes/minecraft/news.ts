import got from 'got';
import { Route } from '@/types';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/minecraft/news',
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
            source: ['minecraft.net/en-us/articles', 'minecraft.net/'],
        },
    ],
    maintainers: ['OutlinedArc217'],
    url: 'minecraft.net/',
    description: 'Catch up on the latest articles',
    zh: {
        name: 'Minecraft最近新闻',
    },
};

export async function getData() {
    const jsonUrl = 'https://www.minecraft.net/content/minecraftnet/language-masters/en-us/articles/jcr:content/root/container/image_grid_a.articles.page-1.json';
    const baseUrl = 'https://www.minecraft.net';

    const response = await got(jsonUrl);
    const data = JSON.parse(response.body);

    const items = data.article_grid.map((article: any) => ({
        title: article.default_tile.title || 'No title available',
        link: new URL(article.article_url, baseUrl).href,
    }));

    return {
        title: 'Minecraft News',
        link: baseUrl,
        description: 'Catch up on the latest articles',
        item: items.map((item: any) => ({
            title: item.title,
            link: item.link,
        })),
    };
}
