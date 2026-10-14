// Adapted from the computer science school route.
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';
import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fetchArticle, fixArticleContent, normalizeUrl } from '@/utils/wechat-mp';

const baseUrl = 'https://swrh.whu.edu.cn';
function parseCalendarDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
class ArticleAccessError extends Error {}
function requiresArticleAuthentication($: CheerioAPI) {
    if ($('title').text() === '系统提示' && $('.prompt p').text().trim() === '暂无权限，请咨询管理员。') {
        return true;
    }
    return (
        !$('.v_news_content').length &&
        $('script')
            .toArray()
            .some((element) => /^\s*window\.location\.href\s*=\s*['"]https:\/\/cas\.whu\.edu\.cn\/authserver\/login\?service=/.test($(element).text()))
    );
}
async function getArticleDetails(link: string) {
    const response = await got(link);
    const $ = load(response.data);
    if ($('title').text() === '用户验证' && $('body').text().includes('验证码')) {
        throw new ArticleAccessError(`Article access verification required at ${link}`);
    }
    if (requiresArticleAuthentication($)) {
        throw new ArticleAccessError(`Article access permission or authentication required at ${link}`);
    }
    const body = $('.v_news_content');
    if (body.length !== 1) {
        throw new Error(`Article body not found at ${link}`);
    }
    body.find('img[src]').each((_, element) => {
        const image = $(element);
        image.attr('src', new URL(image.attr('src')!, link).href);
    });
    const category = $('meta[name="Keywords"]').attr('content')?.split(/\s+/).filter(Boolean);
    return { description: body.html()!.trim(), category: category?.length ? category : undefined };
}
async function getWechatPage(url: string, remainingRedirects = 5): Promise<CheerioAPI> {
    const response = await ofetch.raw<string>(url, { redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location || remainingRedirects <= 1) {
            throw new Error(`Cannot resolve WeChat article redirect at ${url}`);
        }
        return await getWechatPage(new URL(location, url).href, remainingRedirects - 1);
    }
    return load(response._data ?? '');
}
async function getWechatDetails(link: string) {
    const normalizedUrl = normalizeUrl(link);
    const $ = await getWechatPage(normalizedUrl);
    const scripts = $('script[nonce][type="text/javascript"]')
        .toArray()
        .map((script) => $(script).text());
    const showTypePattern = /\bitem_show_type\s*=\s*(['"])(\d+)\1/;
    const commonScript = scripts.find((script) => /\breal_item_show_type\s*=\s*(['"])\d+\1/.test(script));
    const showType = commonScript?.match(showTypePattern)?.[2] ?? scripts.map((script) => script.match(showTypePattern)?.[2]).find(Boolean);
    if (showType !== '0') {
        // Other message types retain the shared parser's existing media behavior.
        return { description: (await fetchArticle(link)).description, category: undefined };
    }
    const body = $('#js_content');
    const originalLink = body.text() ? (body.text().length < 80 ? body.find('a').first().attr('href') : undefined) : $('#js_share_source').attr('data-url');
    if (body.length !== 1 && !originalLink) {
        throw new Error(`WeChat article body not found at ${link}`);
    }
    let description = fixArticleContent(body);
    if (originalLink) {
        const original = await getWechatPage(normalizeUrl(originalLink));
        const originalBody = original('#js_content');
        if (originalBody.length !== 1) {
            throw new Error(`WeChat article body not found at ${originalLink}`);
        }
        description += fixArticleContent(originalBody);
    }
    return { description, category: undefined };
}
export const route: Route = {
    path: '/swrh/:type',
    categories: ['university'],
    example: '/whu/swrh/2',
    radar: [
        {
            source: ['swrh.whu.edu.cn/index/xyxw.htm', 'swrh.whu.edu.cn/0'],
            target: '/swrh/0',
        },
        {
            source: ['swrh.whu.edu.cn/index/xsky.htm', 'swrh.whu.edu.cn/1'],
            target: '/swrh/1',
        },
        {
            source: ['swrh.whu.edu.cn/xxgk/tzgg.htm', 'swrh.whu.edu.cn/2'],
            target: '/swrh/2',
        },
    ],
    parameters: { type: '公告类型，详见表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '水利水电学院公告',
    maintainers: ['FanofZY'],
    handler,
    description: `| 公告类型 | 学院新闻 | 学术科研 | 通知公告 |
| -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        |`,
};
async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    let link;
    switch (type) {
        case 0:
            link = `${baseUrl}/index/xyxw.htm`; // School news
            break;
        case 1:
            link = `${baseUrl}/index/xsky.htm`; // Academic research
            break;
        case 2:
            link = `${baseUrl}/xxgk/tzgg.htm`; // Notices
            break;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
    const response = await got(link);
    const $ = load(response.data);
    const list =
        type === 0
            ? $('div.my_box_nei')
                  .toArray()
                  .map(
                      (
                          item
                      ): DataItem & {
                          link: string;
                      } => {
                          const $item = $(item);
                          return {
                              title: $item.find('a b.am-text-truncate').text(),
                              pubDate: parseCalendarDate($item.find('a i').text()),
                              link: new URL($item.find('a').attr('href')!, baseUrl).href,
                          };
                      }
                  )
            : $('div.list_txt.am-fr ul.am-list li')
                  .toArray()
                  .map(
                      (
                          item
                      ): DataItem & {
                          link: string;
                      } => {
                          const $item = $(item);
                          return {
                              title: $item.find('a span').text(),
                              pubDate: parseCalendarDate($item.find('a i').text()),
                              link: new URL($item.find('a').attr('href')!, baseUrl).href,
                          };
                      }
                  );
    let items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`whu:swrh:absolute-media:${item.link}`, async () =>
                        // Select the WeChat parser for the official article host.
                        new URL(item.link).hostname === 'mp.weixin.qq.com' ? await getWechatDetails(item.link) : await getArticleDetails(item.link)
                    );
                    return { ...item, description: detail.description, category: detail.category };
                } catch (error) {
                    if (error instanceof ArticleAccessError || (error instanceof Error && error.name === 'FetchError')) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    items = items.filter((item) => item !== null);
    return {
        title: $('title').text(),
        link,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
