import { type CheerioAPI, load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import { config } from '@/config';
import CaptchaError from '@/errors/types/captcha';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const baseUrl = 'https://xsijishe.com';
type ForumSource = {
    cookie: string;
    browser?: Awaited<ReturnType<typeof getPlaywrightPage>>;
    initializingBrowser?: Promise<Awaited<ReturnType<typeof getPlaywrightPage>>>;
};

export const route: Route = {
    path: '/forum/:fid',
    categories: ['bbs'],
    example: '/xsijishe/forum/51',
    parameters: { fid: '子论坛 id' },
    features: {
        requireConfig: [
            {
                name: 'XSIJISHE_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '论坛',
    maintainers: ['akynazh'],
    handler,
    description: `::: tip 关于子论坛 id 的获取方法
\`/xsijishe/forum/51\` 对应于论坛 \`https://xsijishe.com/forum-51-1.html\`，这个论坛的 fid 为 51，也就是 \`forum-{fid}-1\` 中的 fid。
:::`,
};

function parseForumDate(value?: string) {
    const text = value?.trim();
    if (!text) {
        return;
    }
    const date = parseDate(text);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function resolveForumLink(value: string | undefined, base: string) {
    if (!value) {
        return;
    }
    try {
        const link = new URL(value, base);
        return link.origin === baseUrl ? link.href : undefined;
    } catch {
        return;
    }
}

function checkAccess($: CheerioAPI) {
    if ($('#messagelogin').length) {
        throw new ConfigNotFoundError('Set XSIJISHE_COOKIE to a valid logged-in session that can access this forum.');
    }
    if ($('#messagetext').length) {
        throw new Error('The Xsijishe account cannot access this forum or thread. Check its permissions on the source website.');
    }
}

function isChallenge($: CheerioAPI) {
    return $('script[src*="/cdn-cgi/challenge-platform/"], #challenge-running, #challenge-stage').length > 0 || $('script').text().includes('cf-chl-');
}

async function createBrowser(source: ForumSource) {
    const browser = await getPlaywrightPage(baseUrl, {
        noGoto: true,
        closeTimeout: 0,
        onBeforeLoad: async (_page, context) => {
            const cookies = source.cookie
                .split(';')
                .map((entry) => entry.trim())
                .filter((entry) => entry.indexOf('=') > 0)
                .map((entry) => {
                    const separator = entry.indexOf('=');
                    return { name: entry.slice(0, separator), value: entry.slice(separator + 1), url: `${baseUrl}/` };
                });
            await context!.addCookies(cookies);
            await context!.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    source.browser = browser;
    await browser.page.close();
    return browser;
}

async function fetchForumDocument(link: string, selector: string, source: ForumSource) {
    if (!source.initializingBrowser) {
        try {
            const response = await got(link, { headers: { Cookie: source.cookie } });
            const $ = load(response.data);
            checkAccess($);
            if ($(selector).length || !isChallenge($)) {
                return $;
            }
        } catch (error) {
            if (!(error instanceof FetchError) || (error.status !== 403 && error.status !== 429)) {
                throw error;
            }
        }
    }

    source.initializingBrowser ??= createBrowser(source);
    const { context } = await source.initializingBrowser;
    const page = await context.newPage();
    try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
        try {
            await page.waitForSelector(`${selector}, #messagelogin, #messagetext`, { state: 'attached', timeout: 15000 });
        } catch (error) {
            if (!(error instanceof Error) || error.name !== 'TimeoutError') {
                throw error;
            }
        }
        const html = await page.content();
        const $ = load(html);
        checkAccess($);
        if (!$(selector).length) {
            if (isChallenge($)) {
                throw new CaptchaError('Xsijishe is still requesting browser verification. Retry later or check the configured browser connection.');
            }
            throw new Error('Xsijishe did not provide the expected forum content. Check source access and whether its page layout has changed.');
        }
        return $;
    } finally {
        await page.close();
    }
}

async function fetchArticleContent(link: string, source: ForumSource): Promise<Pick<DataItem, 'description'>> {
    const $ = await fetchForumDocument(link, '.t_f', source);
    const firstViewBox = $('.t_f').first();
    const post = firstViewBox.closest('[id^="post_"]');

    firstViewBox.find('.jammer, [style*="display:none"]').remove();
    firstViewBox.append(post.find('.pattl img[zoomfile]'));
    firstViewBox.find('img').each((_, img) => {
        const $img = $(img);
        if ($img.attr('zoomfile')) {
            $img.attr('src', $img.attr('zoomfile'));
            $img.removeAttr('zoomfile');
            $img.removeAttr('file');
        }
        $img.removeAttr('onmouseover');
    });

    if (!firstViewBox.text().trim() && !firstViewBox.find('img[src], video, audio, iframe').length) {
        throw new Error('Xsijishe did not provide a readable first post. Check the account permissions on the source website.');
    }
    return { description: firstViewBox.html()! };
}

async function handler(ctx) {
    const fid = ctx.req.param('fid');
    const url = `${baseUrl}/forum-${fid}-1.html`;
    if (!config.xsijishe.cookie) {
        throw new ConfigNotFoundError('Set XSIJISHE_COOKIE to a valid logged-in session that can access this forum.');
    }
    const source: ForumSource = { cookie: config.xsijishe.cookie };
    try {
        const $ = await fetchForumDocument(url, '[id^="normalthread"]', source);
        const forumCategory = $('.nex_bkinterls_top .nex_bkinterls_ls a').text();
        let items = $('[id^="normalthread"]')
            .toArray()
            .flatMap((item): Array<DataItem & { link: string }> => {
                const $item = $(item);
                const nexAuthorBtms = $item.find('.nex_author_btms');
                const nexForumtitTopA = $item.find('.nex_forumtit_top a').first();
                const link = resolveForumLink(nexForumtitTopA.attr('href'), url);
                if (!link) {
                    return [];
                }
                const nexFtdate = nexAuthorBtms.find('.nex_ftdate');
                const pubDate = nexFtdate.find('span').length > 0 ? nexFtdate.find('span').attr('title') : nexFtdate.text().replace('发表于', '');
                return [
                    {
                        title: nexForumtitTopA.text(),
                        pubDate: parseForumDate(pubDate),
                        category: nexAuthorBtms.find('em a').text().trim(),
                        link,
                        author: $item.find('.nex_threads_author').find('a').text().trim(),
                    },
                ];
            });
        items = await pMap(
            items,
            async (item) => {
                const detail = await cache.tryGet(`xsijishe:article:v2:${item.link!}`, () => fetchArticleContent(item.link!, source));
                return { ...item, ...detail };
            },
            { concurrency: 3, stopOnError: false }
        );
        return {
            title: `司机社${forumCategory}论坛`,
            link: url,
            description: `司机社${forumCategory}论坛`,
            item: items,
        };
    } finally {
        await source.browser?.destroy();
    }
}
