import { Route, DataItem } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/nijijourney/blog',
    name: 'Blog',
    maintainers: ['neverbiasu'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: true,
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

const fetchArticleContent = async (item: DataItem, sharedBrowser: any): Promise<DataItem> => {
    let page;
    try {
        page = await sharedBrowser.newPage();

        await page.setViewport({ width: 1280, height: 720 });
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'document' || resourceType === 'script' || resourceType === 'xhr') {
                request.continue();
            } else {
                request.abort();
            }
        });

        let retries = 3;
        let waitTime = 2000;
        let pageContent = '';

        while (retries > 0) {
            try {
                // eslint-disable-next-line no-await-in-loop
                await page.goto(item.link!, {
                    waitUntil: 'networkidle0',
                    timeout: 30000,
                });
                // eslint-disable-next-line no-await-in-loop
                pageContent = await page.content();
                break;
            } catch (error) {
                retries--;
                if (retries === 0) {
                    throw error;
                }
                // eslint-disable-next-line no-await-in-loop
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                waitTime *= 2;
            }
        }

        const $ = load(pageContent);

        const candidateSelectors = [
            '#__next > div.min-h-screen.flex.flex-col > div > div.space-y-8.pb-8.flex-1 > section:nth-child(3)',
            'article',
            'section.max-w-prose',
            'div.max-w-prose',
            'main section',
            'main div[class*="prose"]',
            'div[class*="space-y-4"]',
            'section:last-of-type',
            'body > div:last-child section',
        ];

        let fullContent = '';

        for (const selector of candidateSelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                const content = elements.html()?.trim() || '';
                if (content.length > 200) {
                    fullContent = content;
                    break;
                }
            }
        }

        if (!fullContent) {
            const fallbackContent = $('body').text().trim();
            if (fallbackContent.length > 500) {
                fullContent = fallbackContent.slice(0, 2000) + '...';
            }
        }

        return {
            ...item,
            description: fullContent || item.description || 'Content extraction failed',
        };
    } catch (error) {
        logger.error(`Error fetching article content for ${item.link}: ${error}`);
        return {
            ...item,
            description: item.description || 'Content extraction failed due to error',
        };
    } finally {
        if (page && !page.isClosed()) {
            await page.close().catch(() => {});
        }
    }
};

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

        await page.goto(blogUrl, { waitUntil: 'networkidle0', timeout: 30000 });
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

        if (page && !page.isClosed()) {
            await page.close();
            page = null;
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
