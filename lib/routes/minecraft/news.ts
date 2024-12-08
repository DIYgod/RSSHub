import { Route } from '@/types';
import puppeteer from 'puppeteer';
import cache from '@/utils/cache';
import { URL } from 'url';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/minecraft/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
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

export async function getNewsItems(baseUrl: string, articlesUrl: string): Promise<any> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(articlesUrl, { waitUntil: 'networkidle2' });

    const items = await page.evaluate(() => {
        const articles = Array.from(
            document.querySelectorAll('.MC_imageGridA_picture')
        );
        return articles.map((element) => {
            const title = element.querySelector('h3.MC_Heading_4')?.textContent?.trim() || '';
            const link = new URL(element.parentElement?.getAttribute('href') || '', window.location.href).href;
            return { title, link };
        });
    });

    await browser.close();

    return items;
}

export async function getDetailedItems(items: any[], browser: puppeteer.Browser): Promise<any[]> {
    return await Promise.all(
        items.map(async (item) => {
            const detailPage = await browser.newPage();
            await detailPage.goto(item.link, { waitUntil: 'networkidle2' });
            const content = await detailPage.evaluate(() => {
                return document.querySelector('.MC_Link_Style_RichText')?.innerHTML || 'No content available';
            });
            await detailPage.close();
            return { ...item, description: content };
        })
    );
}

export async function handleRequest(baseUrl: string, articlesUrl: string) {
    const browser = await puppeteer.launch();
    const items = await getNewsItems(baseUrl, articlesUrl);
    const detailedItems = await getDetailedItems(items, browser);

    const result = {
        title: 'Minecraft News',
        link: articlesUrl,
        description: 'Catch up on the latest articles',
        item: detailedItems,
    };

    await browser.close();

    return result;
    }
