import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

/**
 * Convert an array into a dictionary object.
 * The keys of the dictionary object are the `id` properties of the elements in the array,
 * and the values are the remaining properties of each element.
 * @param {Array} arr - The array to be converted.
 * @returns {Object} - The converted dictionary object.
 */
const arrayToDictionary = (arr) => Object.fromEntries(arr.map(({ id, ...rest }) => [id, rest]));

const allowedResourceTypes = new Set(['document', 'xhr', 'fetch']);

function isCertificateTrustError(error: unknown): error is Error {
    return error instanceof Error && (('code' in error && (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE')) || isCertificateTrustError(error.cause));
}

async function requestData(page: Page | undefined, url: string, form?: Record<string, string | number>) {
    if (!page) {
        const { data } = form ? await got.post(url, { form }) : await got(url);
        return data;
    }
    const body = form ? new URLSearchParams(Object.entries(form).map(([key, value]) => [key, String(value)])).toString() : undefined;
    return await page.evaluate(
        async ({ url, body }) => {
            const response = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body } : undefined);
            if (!response.ok) {
                throw new Error(`LatePost returned HTTP ${response.status}: ${url}`);
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        },
        { url, body }
    );
}

export const route: Route = {
    path: '/:proma?',
    categories: ['new-media'],
    example: '/latepost',
    parameters: { proma: '栏目 id，见下表，默认为最新报道' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '报道',
    maintainers: ['nczitzk'],
    handler,
    description: `| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
| -------- | -------- | -------- | ---------- | ------ |
|          | 1        | 2        | 3          | 4      |`,
};

async function handler(ctx): Promise<Data> {
    try {
        return await fetchFeed(ctx);
    } catch (error) {
        if (!(error instanceof FetchError) || !isCertificateTrustError(error)) {
            throw error;
        }
    }
    const { page, destroy } = await getPlaywrightPage('https://www.latepost.com/', { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (allowedResourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        const response = await page.goto('https://www.latepost.com/', { waitUntil: 'domcontentloaded' });
        if (!response?.ok() || new URL(page.url()).origin !== 'https://www.latepost.com') {
            throw new Error('LatePost did not provide its public website.');
        }
        return await fetchFeed(ctx, page);
    } finally {
        await destroy();
    }
}

async function fetchFeed(ctx, page?: Page): Promise<Data> {
    const proma = ctx.req.param('proma');
    const limit = getRouteLimit(ctx, 5);

    const title = '晚点';
    const defaultTitle = '最新报道';
    const exclusiveCategory = '晚点独家';

    const rootUrl = 'https://www.latepost.com';
    const currentUrl = new URL(proma ? `news/index?proma=${proma}` : '', rootUrl).href;

    const apiColumnUrl = new URL('site/get-column', rootUrl).href;
    const apiCommentUrl = new URL('news/get-comment', rootUrl).href;
    const apiUrl = new URL(proma ? 'news/get-news-data' : 'site/index', rootUrl).href;

    const columnResponse = await requestData(page, apiColumnUrl);
    const columns = arrayToDictionary(columnResponse?.data ?? []);

    const response = await requestData(page, apiUrl, {
        page: 1,
        limit,
        programa: Number(proma),
    });

    const list: Array<{
        title: string;
        link: string;
        category: Array<string | undefined>;
        guid: string | number;
        pubDate?: Date;
    }> = response.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.detail_url, rootUrl).href,
        category: [Number(item.is_dj) === 1 ? exclusiveCategory : undefined, item.programa ? columns[item.programa]?.title : undefined, ...item.label.map((c) => c.label)],
        guid: item.id,
        pubDate: item.release_time ? parseDate(item.release_time, ['MM月DD日', 'YYYY年MM月DD日']) : undefined,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const article = await cache.tryGet(`latepost:article:${item.link}`, async () => {
                const detailResponse = await requestData(page, item.link);

                const commentResponse = await requestData(page, apiCommentUrl, {
                    news_id: item.guid,
                    page: 1,
                    limit: 1,
                    sort: 1,
                    delete_num: 0,
                });

                const content = load(detailResponse);

                const title = content('div.article-header-title').text();

                // The cover image lives outside of the article body (#select-main), in either the
                // `.abstract` block (exclusives / long reads) or `.interview-pic` (interviews).
                // Fall back to the share image embedded in the page script, which covers both layouts.
                let cover = content('#abstract_img').attr('src') || content('img.interview-pic').attr('src');
                if (!cover) {
                    cover = /var\s+imgUrl\s*=\s*'([^']+)'/.exec(detailResponse)?.[1];
                }
                // The site serves the cover over plain http, which readers may refuse to load.
                const coverHtml = cover ? `<img src="${new URL(cover, rootUrl).href.replace(/^http:/, 'https:')}">` : '';

                const abstract = content('div.abstract-pic-left').html();
                const abstractHtml = abstract ? `<blockquote>${abstract}</blockquote>` : '';

                const description = coverHtml + abstractHtml + content('#select-main').html()!.replaceAll('<p><br></p>', '');
                const author = content('div.article-header-author div.author-link a.label').first().text();
                const date = content('div.article-header-date').text();
                const pubDate = date
                    ? /\d+月\d+日/.test(date)
                        ? timezone(parseDate(date, ['YYYY年MM月DD日 HH:mm', 'MM月DD日 HH:mm']), 8)
                        : /ago|^(?:just\s*now|刚刚|剛剛)$|(?:[秒天周月年]|分[钟鍾]?|小[时時]|星期)\s*[前后後]/.test(date)
                          ? parseRelativeDate(date)
                          : timezone(parseRelativeDate(date), 8)
                    : undefined;

                return { title, description, author, pubDate, comments: Number(commentResponse.count ?? commentResponse.data?.length ?? 0) };
            });
            return {
                ...item,
                title: item.title ?? article.title,
                description: article.description,
                author: article.author,
                category: item.category.filter((category): category is string => Boolean(category)),
                guid: `latepost-${item.guid}`,
                pubDate: article.pubDate ?? (item.pubDate ? timezone(item.pubDate, 8) : undefined),
                comments: article.comments,
            };
        },
        { concurrency: 3 }
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    const currentResponse = await requestData(page, currentUrl);

    const $ = load(currentResponse);

    return {
        item: items,
        title: `${title} - ${proma ? columns[proma].title : defaultTitle}`,
        link: currentUrl,
        description: $('div.logo-txt').first().text(),
        language: 'zh-CN',
        image: new URL($('div.logo-txt img').prop('src')!, rootUrl).href,
        icon,
        logo: icon,
        author: title,
    };
}
