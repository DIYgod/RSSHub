import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';

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

async function handler() {
    const baseUrl = 'https://www.minecraft.net';
    const articlesUrl = `${baseUrl}/content/minecraftnet/language-masters/en-us/articles/jcr:content/root/container/image_grid_a.articles.page-1.json`;

    const response = await got(articlesUrl, { responseType: 'json' });
    const data = response.data;

    const items = data.article_grid.map((article) => ({
        title: article.default_tile.title,
        link: new URL(article.article_url, baseUrl).href,
    }));
    
    const detailedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $detail = cheerio.load(detailResponse.data);
                const content = $detail('.MC_Link_Style_RichText').html() || 'No content available';

                return {
                    title: item.title,
                    link: item.link,
                    description: content,
                };
            })
        )
    );

    return {
        title: 'Minecraft News',
        link: articlesUrl,
        description: 'Catch up on the latest articles',
        item: detailedItems,
    };
}

export { handler };
