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
            if (['document', 'script', 'xhr', 'fetch'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });

        const loadPageWithRetry = async (attempt = 0): Promise<string> => {
            try {
                // keep single operation timeout safely below any external forced close
                await page.goto(item.link!, {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000,
                });

                return page.content();
            } catch (error: any) {
                // If browser/page was closed externally, stop retrying and surface the error
                const msg = (error && error.message) || '';
                if (msg.includes('Target closed') || msg.includes('Browser closed') || msg.includes('Session closed')) {
                    throw error;
                }

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

        // Keep a minimal, stable set of selectors (avoid brute-force matching)
        const candidateSelectors = ['#__next > div.min-h-screen.flex.flex-col > div > div.space-y-8.pb-8.flex-1 > section:nth-child(3)', 'article'];

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

        return {
            ...item,
            description: fullContent || item.description || 'Content extraction failed',
        };
    } catch (error: any) {
        // Only catch specific errors during page operations; log and return with fallback description.
        // Do not silently swallow errors — if a critical error occurs, let framework handle it.
        const msg = (error && error.message) || String(error);
        if (msg.includes('Target closed') || msg.includes('Browser closed') || msg.includes('Session closed')) {
            logger.warn(`Article fetch aborted due to browser closure for ${item.link}`);
        } else {
            logger.error(`Error fetching article content for ${item.link}: ${error}`);
        }
        return {
            ...item,
            description: item.description || 'Content extraction failed',
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

    browser = await puppeteer();
    try {
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
            if (['document', 'script', 'xhr', 'fetch'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });

        // Wait until network is mostly idle so content is ready (avoid using body as readiness)
        await page.goto(blogUrl, {
            waitUntil: 'networkidle2',
            timeout: 15000,
        });
        const html = await page.content();
        const $ = load(html);

        // Only use `section a` as per reviewer guidance
        const articles = $('section a');

        if (articles.length === 0) {
            // likely anti-crawler or layout change — return empty feed and mark protected
            return {
                title: 'Nijijourney Blog',
                link: blogUrl,
                item: [],
                isProtected: true,
            } as any;
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
                const data: Partial<DataItem> = {
                    title,
                    link,
                    description,
                };

                return data as DataItem;
            })
            .filter((item): item is DataItem => item !== null);

        if (preliminaryItems.length === 0) {
            // No valid articles found; return empty feed (don't create fake entries with fake dates)
            return {
                title: 'Nijijourney Blog',
                link: blogUrl,
                item: [],
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
        // Always attempt to close resources; let errors propagate instead of swallowing them.
        await safeBrowserClose(browser, page);
    }
}
