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
    try {
        if (page && !page.isClosed()) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
    } catch (error) {
        logger.error(`Error closing browser or page: ${error}`);
    }
}

const fetchArticleContent = async (item: DataItem, sharedBrowser: any): Promise<DataItem> => {
    let page;
    try {
        page = await sharedBrowser.newPage();

        await page.setViewport({ width: 1280, height: 720 });

        await page.setExtraHTTPHeaders({
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            Referer: 'https://nijijourney.com/blog',
        });

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            // 允许必要的资源类型
            if (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });

        const loadPageWithRetry = async (attempt = 0): Promise<string> => {
            try {
                await page.goto(item.link!, {
                    waitUntil: 'domcontentloaded',
                    timeout: 20000,
                });

                await page.waitForSelector('body', { timeout: 3000 }).catch(() => {
                    // if loading error, continue
                });

                return page.content();
            } catch (error) {
                if (attempt >= 2) {
                    throw error;
                }

                const delay = 2000 * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return loadPageWithRetry(attempt + 1);
            }
        };

        const pageContent = await loadPageWithRetry();

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

        await page.setViewport({ width: 1280, height: 720 });

        await page.setExtraHTTPHeaders({
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        });

        await page.setRequestInterception(true);

        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });

        await page.goto(blogUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        try {
            await page.waitForSelector('a', { timeout: 5000 });
        } catch {
            // if waiting error, continue
        }
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
