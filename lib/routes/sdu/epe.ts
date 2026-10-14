import { type CheerioAPI, load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import timezone from '@/utils/timezone';

const host = 'https://www.epe.sdu.edu.cn/';
const typelist = ['学院动态', '通知公告', '学术动态'];
const urlList = ['xyxw.htm', 'tzgg.htm', 'kxyj/xsdt.htm'];

type CyolResponse = {
    code: number;
    data?: {
        contId: string | number;
        title: string;
        pubTime?: string;
        author?: string;
        textInfo?: { content?: string };
    };
};

function getCollegeArticleCredits($: CheerioAPI) {
    const credits: string[] = [];
    for (const element of $('.v_news_content').first().children().toArray().toReversed()) {
        const paragraph = $(element);
        const text = paragraph.text().trim();
        const hasMediaOrLinks = paragraph.find('img, video, audio, a').length > 0;
        if (!text && !hasMediaOrLinks) {
            continue;
        }
        if (!paragraph.is('p') || hasMediaOrLinks || !/^[（(]?(?:文图|文字|文|图片|图|摄影|作者|审核|审|编辑)[/：:]/.test(text)) {
            break;
        }
        credits.unshift(text);
        paragraph.remove();
    }
    return credits.length ? credits.join('；') : undefined;
}

async function findCyolGuestToken(scriptUrls: string[]): Promise<string | undefined> {
    if (!scriptUrls.length) {
        return;
    }
    const scripts = await pMap(scriptUrls.slice(0, 2), (url) => ofetch(url, { responseType: 'text' }), { concurrency: 2 });
    const token = scripts.map((script) => script.match(/localStorage\.getItem\("cyol-token"\)\|\|"([^"]+)"/)?.[1]).find(Boolean);
    return token ?? findCyolGuestToken(scriptUrls.slice(2));
}

async function getCyolArticle(articleId: string, scriptUrls: string[]) {
    if (!scriptUrls.length) {
        return {};
    }
    try {
        // Use the anonymous fallback shipped by the public page, never a visitor's stored token.
        const token = await cache.tryGet(`sdu:cyol:anonymous-token-v1:${scriptUrls[0]}`, () => findCyolGuestToken(scriptUrls));
        if (!token) {
            return {};
        }
        const response = await ofetch<CyolResponse>('https://api.cyol.com/wap/news/newsDetails', {
            method: 'POST',
            body: { contId: Number(articleId) },
            headers: { 'cyol-client-type': '02', 'cyol-token': token },
        });
        const article = response.data;
        if (response.code !== 200 || !article || String(article.contId) !== articleId || !article.title || !article.textInfo?.content) {
            return {};
        }
        const $ = load(article.textInfo.content);
        $('.and_luokuan').remove();
        const byline = $('p').filter((_, element) => /^[（(]作者[：:].+[）)]$/.test($(element).text().trim()));
        const author =
            article.author ||
            byline
                .first()
                .text()
                .trim()
                .match(/^[（(]作者[：:](.+)[）)]$/)?.[1];
        if (author) {
            byline.remove();
        }
        return {
            title: article.title,
            author,
            description: $('body').html() ?? undefined,
            ...(article.pubTime && { pubDate: parseDateInTimezone(article.pubTime.replace(' ', 'T'), 8) }),
        };
    } catch (error) {
        if (error instanceof FetchError) {
            return {};
        }
        throw error;
    }
}

export const route: Route = {
    path: '/epe/:type?',
    categories: ['university'],
    example: '/sdu/epe/0',
    parameters: { type: '默认为 `0`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '核科学与能源动力学院通知',
    maintainers: ['Ji4n1ng'],
    handler,
    description: `| 学院动态 | 通知公告 | 学术动态 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? Number.parseInt(ctx.req.param('type')) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.text-list li')
        .toArray()
        .flatMap((element) => {
            const $element = $(element);
            const anchor = $element.find('a');
            const href = anchor.attr('href');
            const title = anchor.attr('title') ?? anchor.text();
            if (!href || !title) {
                return [];
            }
            return { title, link: new URL(href, link).href, pubDate: timezone(parseDate($element.find('span').text(), 'YYYY-MM-DD'), 8) };
        });

    const item = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await recoverArticle(
                cache.tryGet(`epe:article-v6:${item.link}`, async () => {
                    const isChinanews = new URL(item.link).hostname === 'www.sd.chinanews.com.cn';
                    const response = await got(item.link, isChinanews ? { responseType: 'buffer' } : undefined);
                    const $ = load(isChinanews ? new TextDecoder('gb18030').decode(response.data) : response.data);
                    const articleUrl = new URL(item.link);
                    const cyolArticleId = articleUrl.hostname === 'wap.cyol.com' ? articleUrl.pathname.match(/^\/commonDetail\/(\d+)$/)?.[1] : undefined;
                    if (cyolArticleId) {
                        const scriptUrls = $('script[src]')
                            .toArray()
                            .flatMap((element) => {
                                const src = $(element).attr('src');
                                return src ? [new URL(src, articleUrl)] : [];
                            })
                            .filter((url) => url.origin === articleUrl.origin && /^\/js\/main-[^/]+\.js$/.test(url.pathname))
                            .map((url) => url.href)
                            .toReversed();
                        return getCyolArticle(cyolArticleId, scriptUrls);
                    }
                    const title = $('.art-tit h3').text() || $('meta[name="ArticleTitle"]').attr('content') || item.title;
                    const content = $('.v_news_content, .contentWrap .zhenwen').first();
                    const collegeCredits = getCollegeArticleCredits($);
                    const byline = isChinanews ? content.children('p').last() : undefined;
                    const bylineText = byline?.text().trim();
                    const hasByline = bylineText && hasCreditByline(bylineText);
                    const viewCredits = articleUrl.hostname === 'www.view.sdu.edu.cn' ? $('.art-body > p').last().text().trim() : undefined;
                    const author = $('meta[name="ArticleAuthor"]').attr('content') || collegeCredits || viewCredits || (hasByline ? bylineText : undefined);
                    if (hasByline) {
                        byline?.remove();
                    }
                    const publishedTime = isChinanews
                        ? $('.suoying')
                              .text()
                              .match(/(\d{4})年(\d{2})月(\d{2})日 (\d{2}:\d{2})/)
                        : undefined;
                    return {
                        title,
                        author,
                        description: content.html() ?? undefined,
                        ...(publishedTime && { pubDate: parseDateInTimezone(`${publishedTime[1]}-${publishedTime[2]}-${publishedTime[3]}T${publishedTime[4]}:00`, 8) }),
                    };
                })
            )),
        }),
        { concurrency: 3 }
    );

    return {
        title: `山东大学核科学与能源动力学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
}

async function recoverArticle<T>(promise: Promise<T>) {
    try {
        return await promise;
    } catch (error) {
        if (error instanceof FetchError) {
            return {};
        }
        throw error;
    }
}

function hasCreditByline(text: string) {
    if (!text.startsWith('文：')) {
        return false;
    }
    let lineBreak = -1;
    let whitespaceSuffix = true;
    for (let index = 2; index < text.length; index++) {
        if (text.startsWith('图：', index) && ((lineBreak === -1 && index >= 4 && /\s/.test(text[index - 1])) || (lineBreak > 2 && whitespaceSuffix))) {
            return true;
        }
        if (lineBreak === -1 && /[\n\r\u{2028}\u{2029}]/u.test(text[index])) {
            lineBreak = index;
        } else if (lineBreak !== -1 && !/\s/.test(text[index])) {
            whitespaceSuffix = false;
        }
    }
    return false;
}
