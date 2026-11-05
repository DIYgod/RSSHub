import { load } from 'cheerio';
import type { Page, Response } from 'patchright';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

type ArticleMetadata = { abstract?: string; insertDate?: string };
type ArticleBrowser = Awaited<ReturnType<typeof getPlaywrightPage>> & { initialUrl: string; initialMetadata: ArticleMetadata; unavailable?: boolean };
type GetArticleBrowser = (url: string) => Promise<ArticleBrowser>;

function parseMetadata(html: string): ArticleMetadata {
    const $ = load(html);
    const code = $('script[type="text/javascript"]:contains("xplGlobal.document.metadata")').text();
    const match = code.match(/xplGlobal\.document\.metadata\s*=\s*(\{[\s\S]*?\})\s*;/);
    const metadata: ArticleMetadata = match ? JSON.parse(match[1]) : {};
    return {
        abstract: metadata.abstract ? load(metadata.abstract).text() : undefined,
        insertDate: metadata.insertDate,
    };
}

async function waitForMetadata(page: Page) {
    try {
        await page.waitForFunction(() => [...document.scripts].some((script) => script.textContent?.includes('xplGlobal.document.metadata')), undefined, { timeout: 15000 });
        return true;
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            return false;
        }
        throw error;
    }
}

async function createArticleBrowser(articleUrl: string): Promise<ArticleBrowser> {
    const browser = await getPlaywrightPage(articleUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await browser.context.route('**/*', async (route) => {
            await (['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort());
        });
        let onResponse: (response: Response) => void;
        const blocked = new Promise<boolean>((resolve) => {
            onResponse = (response) => {
                if (response.status() === 420 && response.request().resourceType() === 'document' && response.frame() === browser.page.mainFrame() && new URL(response.url()).origin === 'https://ieeexplore.ieee.org') {
                    resolve(false);
                }
            };
            browser.page.on('response', onResponse);
        });
        let available: boolean;
        try {
            const response = await browser.page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
            if (!response || (!response.ok() && response.status() !== 420)) {
                throw new Error(`The IEEE article browser source returned HTTP ${response?.status() ?? 'no response'}.`);
            }
            available = await Promise.race([blocked, waitForMetadata(browser.page)]);
        } finally {
            browser.page.off('response', onResponse!);
        }
        if (new URL(browser.page.url()).origin !== 'https://ieeexplore.ieee.org') {
            throw new Error('The IEEE article source redirected outside IEEE Xplore.');
        }
        return { ...browser, initialUrl: articleUrl, initialMetadata: available ? parseMetadata(await browser.page.content()) : {}, unavailable: !available };
    } catch (error) {
        await browser.destroy();
        throw error;
    }
}

export async function withArticleMetadataBrowser<T>(callback: (getBrowser: GetArticleBrowser) => Promise<T>) {
    let pending: Promise<ArticleBrowser> | undefined;
    let closing = false;
    const getBrowser: GetArticleBrowser = (url) => {
        if (closing) {
            throw new Error('The IEEE article browser session is closing.');
        }
        return (pending ??= createArticleBrowser(url));
    };
    try {
        return await callback(getBrowser);
    } finally {
        closing = true;
        if (pending) {
            let browser: ArticleBrowser | undefined;
            try {
                browser = await pending;
            } catch {
                // Initialization failures already destroy their browser.
            }
            if (browser) {
                await browser.destroy();
            }
        }
    }
}

export function fetchArticleMetadata(link: string, getBrowser?: GetArticleBrowser) {
    const articleUrl = new URL(link, 'https://ieeexplore.ieee.org').href;
    return cache.tryGet(`ieee:article-metadata:v2:${articleUrl}`, async (): Promise<ArticleMetadata> => {
        const response = await ofetch.raw<string, 'text'>(articleUrl, { responseType: 'text' });
        const metadata = parseMetadata(response._data ?? '');
        if (!getBrowser || response.status !== 202 || metadata.abstract || metadata.insertDate) {
            return metadata;
        }
        if (new URL(articleUrl).origin !== 'https://ieeexplore.ieee.org') {
            throw new Error('The IEEE article browser requires an IEEE Xplore URL.');
        }
        const browser = await getBrowser(articleUrl);
        if (browser.unavailable) {
            return metadata;
        }
        if (articleUrl === browser.initialUrl) {
            return browser.initialMetadata;
        }
        const result = await browser.page.evaluate(async (url) => {
            const response = await fetch(url, { redirect: 'manual' });
            return { status: response.status, html: await response.text() };
        }, articleUrl);
        if (result.status === 420) {
            // Keep the API summary if IEEE blocks further metadata in this session.
            browser.unavailable = true;
            return metadata;
        }
        if (result.status < 200 || result.status >= 300) {
            throw new Error(`The IEEE article browser source returned HTTP ${result.status}.`);
        }
        return parseMetadata(result.html);
    });
}
