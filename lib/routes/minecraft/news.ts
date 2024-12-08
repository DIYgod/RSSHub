import puppeteer from 'puppeteer';
import cache from '@/utils/cache';
import { Route } from '@/types';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/minecraft/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const articlesUrl = 'https://www.minecraft.net/en-us/articles';

    await page.goto(articlesUrl, { waitUntil: 'networkidle2' });

    const items = await page.evaluate(() =>
        [...document.querySelectorAll('.MC_imageGridA_picture')].map((element) => {
            const title = element.querySelector('h3.MC_Heading_4')?.textContent?.trim() || '';
            const link = new URL(element.parentElement?.getAttribute('href') || '', window.location.href).href;
            return { title, link };
        })
    );

    const detailedItems = await Promise.all(
        items.map(async (item) => {
            const cachedData = await cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.goto(item.link, { waitUntil: 'networkidle2' });

                const content = await detailPage.evaluate(() => {
                    return document.querySelector('.MC_Link_Style_RichText')?.innerHTML || 'No content available';
                });

                await detailPage.close();

                return {
                    title: item.title,
                    link: item.link,
                    description: content,
                };
            });

            return cachedData;
        })
    );

    await browser.close();

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
