import { Route, DataItem } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/nijijourney/blog',
    name: 'Blog',
    maintainers: ['neverbiasu'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function safeBrowserClose(browser: any, page: any) {
    const errors: string[] = [];
    if (page) {
        try {
            if (!page.isClosed()) {
                await page.close();
            }
        } catch (error) {
            errors.push(`Page close error: ${error}`);
        }
    }
    if (browser) {
        try {
            const pages = await browser.pages();
            const closePromises = pages.map(async (p) => {
                try {
                    if (!p.isClosed()) {
                        await p.close();
                    }
                } catch (error) {
                    errors.push(`Individual page close error: ${error}`);
                }
            });
            await Promise.all(closePromises);
            await browser.close();
        } catch (error) {
            errors.push(`Browser close error: ${error}`);
            try {
                const process = browser.process();
                if (process && !process.killed) {
                    process.kill('SIGKILL');
                }
            } catch (killError) {
                errors.push(`Process kill error: ${killError}`);
            }
        }
    }
}

const fetchArticleContent = (item: DataItem, sharedBrowser: any): Promise<DataItem> =>
    cache.tryGet(item.link!, async () => {
        let page;
        try {
            page = await sharedBrowser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(item.link!, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForSelector('div, article, main', { timeout: 5000 }).catch(() => {});
            const html = await page.content();
            const $ = load(html);
            let fullContent = $('div > div > section:nth-child(3)').html()?.trim();
            if (!fullContent) {
                fullContent = $('article').html()?.trim();
            }
            if (!fullContent) {
                fullContent = $('[class*="content"]').html()?.trim();
            }
            if (!fullContent) {
                fullContent = $('main').html()?.trim();
            }
            return {
                ...item,
                description: fullContent || item.description,
            };
        } catch {
            return item;
        } finally {
            if (page && !page.isClosed()) {
                await page.close().catch(() => {});
            }
        }
    });

async function handler() {
    const baseUrl = 'https://nijijourney.com';
    const blogUrl = `${baseUrl}/blog`;
    let browser;
    let page;
    try {
        browser = await puppeteer();
        page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
        });
        await page.goto(blogUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForFunction(() => document.body && document.body.children.length > 2, { timeout: 15000 }).catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const html = await page.content();
        const $ = load(html);
        let articles = $('section a');
        if (articles.length === 0) {
            articles = $('a[href*="/blog/"]');
        }
        if (articles.length === 0) {
            articles = $('article a');
        }
        if (articles.length === 0) {
            articles = $('a').filter((_, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();
                return !!(href && text && (href.includes('blog') || href.startsWith('/')) && text.length > 5);
            });
        }
        if (articles.length === 0) {
            return {
                title: 'Nijijourney Blog',
                link: blogUrl,
                item: [
                    {
                        title: 'Nijijourney Blog (Access Limited)',
                        description: 'Unable to fetch blog articles due to anti-crawler protection.',
                        link: blogUrl,
                        pubDate: new Date().toUTCString(),
                    },
                ],
            };
        }
        const preliminaryItems = articles
            .toArray()
            .slice(0, 10)
            .map((item) => {
                const $item = $(item);
                const href = $item.attr('href');
                const title = $item.find('h1, h2, h3').text().trim() || $item.text().trim();
                const description = $item.find('p').text().trim() || '';
                if (!href || !title || title.length < 3) {
                    return null;
                }
                const link = href.startsWith('http') ? href : baseUrl + href;
                return {
                    title,
                    link,
                    description,
                    pubDate: new Date().toUTCString(),
                } as DataItem;
            })
            .filter((item): item is DataItem => item !== null);
        if (preliminaryItems.length === 0) {
            return {
                title: 'Nijijourney Blog',
                link: blogUrl,
                item: [
                    {
                        title: 'Nijijourney Blog (No Valid Articles)',
                        description: 'No valid articles found.',
                        link: blogUrl,
                        pubDate: new Date().toUTCString(),
                    },
                ],
            };
        }
        const items = await Promise.all(preliminaryItems.map((item) => fetchArticleContent(item, browser)));
        return {
            title: 'Nijijourney Blog',
            link: blogUrl,
            item: items,
        };
    } finally {
        await safeBrowserClose(browser, page);
    }
}
