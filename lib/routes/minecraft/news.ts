import { Route } from '@/types';
import got from '@/utils/got';
import cheerio from 'cheerio';

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
            source: ['minecraft.net/'],
        },
    ],
    name: 'Minecraft News',
    maintainers: ['OutlinedArc217'],
    handler,
    url: 'minecraft.net/',
    description: `Catch up on the latest articles`,
    zh: {
        name: 'Minecraft最近新闻',
    },
};

async function handler() {
    const baseUrl = 'https://www.minecraft.net';
    const articlesUrl = `${baseUrl}/en-us/articles`;

    const response = await got(articlesUrl);
    const $ = cheerio.load(response.data);

    const items = $('.MC_imageGridA_picture')
        .parent('a')
        .toArray()
        .map((element) => {
            const $element = cheerio(element);
            const title = $element.find('h3.MC_Heading_4').text().trim();
            const link = new URL($element.attr('href'), baseUrl).href;
            return { title, link };
        });

    const detailedItems = await Promise.all(
        items.map(async (item) => {
            const detailResponse = await got(item.link);
            const $detail = cheerio.load(detailResponse.data);
            const content = $detail('.MC_Link_Style_RichText').html() || 'No content available';
            return {
                title: item.title,
                link: item.link,
                description: content,
            };
        })
    );

    return {
        title: 'Minecraft News',
        link: articlesUrl,
        description: 'Catch up on the latest articles',
        item: detailedItems.map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
        })),
    };
}
