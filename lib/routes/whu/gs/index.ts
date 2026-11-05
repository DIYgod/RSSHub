import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

class ArticleAccessError extends Error {}
function parseCalendarDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
const gsIndexMap = new Map([
    [0, 'xwdt.htm'],
    [1, 'xs_ts.htm'],
    [2, 'yxfc.htm'],
    [3, 'tzgg/qb.htm'],
    [4, 'tzgg/zs.htm'],
    [5, 'tzgg/py.htm'],
    [6, 'tzgg/xw.htm'],
    [7, 'tzgg/zlyzyxw.htm'],
    [8, 'tzgg/zh.htm'],
]);
export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/whu/gs/0',
    parameters: { type: '分类，默认为 `0`，具体参数见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gs.whu.edu.cn/index.htm', 'gs.whu.edu.cn/', 'gs.whu.edu.cn/xwdt.htm'],
            target: '/gs',
        },
    ],
    name: '研究生院',
    maintainers: ['Delreyaa'],
    handler,
    url: 'gs.whu.edu.cn/index.htm',
    description: `| 公告类型 | 新闻动态 | 学术探索 | 院系风采 | 通知 (全部) | 通知 (招生) | 通知 (培养) | 通知 (学位) | 通知 (质量与专业学位) | 通知 (综合) |
| -------- | -------- | -------- | -------- | ----------- | ----------- | ----------- | ----------- | --------------------- | ----------- |
| 参数     | 0        | 1        | 2        | 3           | 4           | 5           | 6           | 7                     | 8           |`,
};
async function handler(ctx) {
    const host = 'https://gs.whu.edu.cn/';
    const paremType = ctx.req.param('type');
    const type = paremType ? Number.parseInt(paremType) : 0;
    const response = await got(host + gsIndexMap.get(type));
    const $ = load(response.data);
    const feedTitle = $('div.location a')
        .slice(-2)
        .toArray()
        .map((element) => $(element).text())
        .join(' > ');
    let items = $('.list ul li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const link = $item.find('a').attr('href');
            return {
                title: $item.find('p').text(),
                link: link!.startsWith('http') ? link : new URL(link!, host).href,
                pubDate: parseCalendarDate($item.find('span').text()),
            };
        });
    items = await unwrapFirstFailure(
        pMap(
            items,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`whu:gs:categorized-content:${item.link}`, async () => {
                        const detail = await got(item.link);
                        const content = load(detail.data);
                        if (content('title').text() === '用户验证' && content('body').text().includes('验证码')) {
                            throw new ArticleAccessError(`Article access verification required at ${item.link}`);
                        }
                        if (content('title').text() === '系统提示' && content('.prompt p').text().trim() === '暂无权限，请咨询管理员。') {
                            throw new ArticleAccessError(`Article access permission required at ${item.link}`);
                        }
                        if (content('form[name=_newscontent_fromname]').length !== 1) {
                            throw new Error(`Article body not found at ${item.link}`);
                        }
                        const body = content('.v_news_content');
                        if (body.length !== 1) {
                            throw new Error(`Article main body not found at ${item.link}`);
                        }
                        body.find('script, style').remove();
                        const downloads = content('form[name=_newscontent_fromname] a[href*="news.DownloadAttachUrl"]').filter((_, element) => content(element).parents('.v_news_content').length === 0);
                        body.find('img[src]').each((_, element) => {
                            const image = content(element);
                            const src = image.attr('src');
                            if (src) {
                                image.attr('src', new URL(src, item.link).href);
                            }
                        });
                        body.find('a[href]')
                            .add(downloads)
                            .each((_, element) => {
                                const anchor = content(element);
                                const href = anchor.attr('href');
                                if (href) {
                                    anchor.attr('href', new URL(href, item.link).href);
                                }
                            });
                        const attachments = content('<ul></ul>');
                        downloads.each((_, element) => {
                            const attachmentWrapper1 = content('<li></li>');
                            attachmentWrapper1.append(copyContent(content(element), content));
                            attachments.append(attachmentWrapper1);
                        });
                        const category = content('meta[name="Keywords"]').attr('content')?.split(/\s+/).filter(Boolean);
                        return { description: body.html()! + (downloads.length ? `\n${content.html(attachments)}` : ''), category: category?.length ? category : undefined };
                    });
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
    return {
        title: `武汉大学研究生院 - ${feedTitle}`,
        link: host + gsIndexMap.get(type),
        description: '武大研究生院',
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
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
