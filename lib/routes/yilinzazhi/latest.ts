import { type CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

const articleSelector = '.article-main > .article-content, .blkContainerSblk.collectionContainer';

class ArticleUnavailableError extends Error {}

class ArticleSource {
    private browser?: Awaited<ReturnType<typeof getPlaywrightPage>>;
    private initializingBrowser?: Promise<Awaited<ReturnType<typeof getPlaywrightPage>>>;

    private async createBrowser(link: string) {
        const browser = await getPlaywrightPage(link, {
            noGoto: true,
            closeTimeout: 0,
            onBeforeLoad: async (_page, context) => {
                await context!.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            },
        });
        this.browser = browser;
        await browser.page.close();
        return browser;
    }

    async get(link: string) {
        if (!this.initializingBrowser) {
            try {
                const response = await got(link);
                return load(response.data);
            } catch (error) {
                if (!(error instanceof FetchError) || (error.status !== 403 && error.status !== 429)) {
                    throw error;
                }
            }
        }
        this.initializingBrowser ??= this.createBrowser(link);
        const { context } = await this.initializingBrowser;
        const page = await context.newPage();
        try {
            return await fetchBrowserArticle(page, link);
        } finally {
            await page.close();
        }
    }

    async close() {
        await this.browser?.destroy();
    }
}

async function fetchBrowserArticle(page: Page, link: string, retry = true): Promise<CheerioAPI> {
    const response = await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
    try {
        await page.waitForSelector(articleSelector, { state: 'attached', timeout: 10000 });
    } catch (error) {
        if (retry && error instanceof Error && error.name === 'TimeoutError' && (response?.status() === 403 || response?.status() === 429)) {
            return fetchBrowserArticle(page, link, false);
        }
        throw error;
    }
    const html = await page.content();
    return load(html);
}

export const route: Route = {
    path: '/latest',
    categories: ['reading'],
    view: ViewType.Articles,
    example: '/yilinzazhi/latest',
    radar: [
        {
            source: ['www.yilinzazhi.com'],
            target: '/latest',
        },
    ],
    name: '近期文章汇总',
    maintainers: ['g0ngjie'],
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
    url: 'www.yilinzazhi.com',
    description: '最近一期的文章汇总',
};

type Stage = {
    link: string;
    title: string;
};

type Catalog = {
    title: string;
    tables: DataItem[];
};

async function fetchDescription(link: string, source: ArticleSource): Promise<Pick<DataItem, 'description' | 'author'>> {
    const $ = await source.get(link);
    const currentContainer = $('.article-main > .article-content');
    const detailContainer = currentContainer.length ? currentContainer : $('.blkContainerSblk.collectionContainer');
    if (!detailContainer.text().trim()) {
        throw new ArticleUnavailableError(`Article content is unavailable at ${link}`);
    }
    const author = $('.article-header .article-meta .author').text();
    return { description: detailContainer.html()!, author: author.trim() ? author : undefined };
}

async function fetchCatalog(stage: Stage, currentYear: number, baseUrl: string): Promise<Catalog[]> {
    const stageRes = await got(stage.link);
    const $$ = load(stageRes.data);
    const sections = $$('.catalog-section').toArray();
    if (sections.length) {
        return sections.map<Catalog>((section) => ({
            title: $$(section).find('.catalog-section-title').text(),
            tables: $$(section)
                .find('.article-title a')
                .toArray()
                .map((aTag) => ({
                    title: $$(aTag).text(),
                    link: new URL($$(aTag).attr('href')!, stage.link).href,
                })),
        }));
    }
    const catalogsEl = $$('.maglistbox dl').toArray();
    const children = catalogsEl.map<Catalog>((catalog) => {
        const title = $$(catalog).find('dt span').text();
        const tables = $$(catalog)
            .find('a')
            .toArray()
            .map<DataItem>((aTag) => {
                const href = $$(aTag).attr('href')!;
                const yearType = currentYear + href.slice(4, 5);
                return {
                    title: $$(aTag).text(),
                    link: `${baseUrl}${currentYear}/yl${yearType}/${href}`,
                };
            });
        return { title, tables };
    });
    return children;
}

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.yilinzazhi.com/';
    const response = await got(baseUrl);
    const $ = load(response.data);

    const currentYear = dayjs().year();
    const yearSection = $('.year-section')
        .toArray()
        .find((el) =>
            $(el)
                .find('.year-title')
                .text()
                .includes(currentYear + '')
        );

    const stage = $(yearSection!)
        .find('a')
        .toArray()
        .map<Stage>((elem) => {
            const aTag = $(elem);
            const link = new URL(aTag.attr('href')!, baseUrl).href;
            const title = aTag.text();
            return { link, title };
        })[0];

    const catalogs = await fetchCatalog(stage, currentYear, baseUrl);

    const contents: DataItem[] = catalogs.flatMap((catalog) => catalog.tables.map((table) => ({ ...table, category: catalog.title.trim() ? [catalog.title] : undefined })));

    const source = new ArticleSource();
    try {
        const items = await pMap(
            contents,
            async (target) => {
                try {
                    const detail = await cache.tryGet<Pick<DataItem, 'description' | 'author'>>(`yilinzazhi:article:v2:${target.link}`, () => fetchDescription(target.link!, source));
                    return { ...target, description: detail.description, author: detail.author };
                } catch (error) {
                    if (error instanceof ArticleUnavailableError || error instanceof FetchError || (error instanceof Error && (error.name === 'TimeoutError' || error.message.startsWith('page.goto:')))) {
                        return target;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: '意林 - 近期文章汇总',
            link: stage.link,
            item: items,
        };
    } finally {
        await source.close();
    }
}
