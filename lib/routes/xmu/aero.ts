import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://aerospace.xmu.edu.cn';
const urlMap = {
    tzgg: '/sy/xydt/tzgg/zjgx.htm',
    bksjw: '/sy/rcpy/bkspy/tzgg.htm',
    yjsjw: '/sy/rcpy/yjspy/tzgg.htm',
};
const titleMap = {
    tzgg: '通知公告',
    bksjw: '本科生教务',
    yjsjw: '研究生教务',
};
export const route: Route = {
    path: '/aero/:type',
    categories: ['university'],
    example: '/xmu/aero/yjsjw',
    parameters: { type: '分类见下表' },
    name: '航空航天学院',
    maintainers: ['jch12138'],
    handler,
    description: `| 通知公告 | 本科生教务 | 研究生教务 |
| :------: | :--------: | :--------: |
|   tzgg   |    bksjw   |    yjsjw   |`,
};
function parseArticleContent($: CheerioAPI, link: string) {
    const body = $('.v_news_content').first();
    const description = body.html();
    if (!description) {
        return description;
    }
    const seen = new Set(
        body
            .find('a[href]')
            .toArray()
            .map((element) => new URL($(element).attr('href')!, link).href)
    );
    const attachments = $('<ul class="rsshub-attachments"></ul>');
    $('a[href*="/system/_content/download.jsp"]').each((_, element) => {
        const anchor = $(element);
        const url = new URL(anchor.attr('href')!, link);
        if (!['http:', 'https:'].includes(url.protocol) || seen.has(url.href)) {
            return;
        }
        seen.add(url.href);
        const attachmentWrapper1 = $('<li></li>');
        const attachmentAnchor1 = $('<a></a>').attr('href', url.href).text(anchor.text());
        attachmentWrapper1.append(attachmentAnchor1);
        attachments.append(attachmentWrapper1);
    });
    return description + (attachments.children().length ? $.html(attachments) : '');
}
async function fetchArticleContent(link: string): Promise<Pick<DataItem, 'description'>> {
    const detailResponse = await ofetch(link);
    const content = load(detailResponse);
    return { description: parseArticleContent(content, link) };
}
function parseSourceDate(value?: string) {
    const dateText = value?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (!dateText) {
        return;
    }
    const date = parseDate(dateText, 'YYYY-MM-DD', true);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}
async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = host + urlMap[type];
    const response = await ofetch(link);
    const $ = load(response);
    const list = $('.ej_list ul li')
        .toArray()
        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                const $a = $item.find('a');
                return {
                    title: $a.attr('title') ?? '',
                    link: new URL($a.attr('href')!, link).href,
                    pubDate: parseSourceDate($item.find('.sj').text()),
                };
            }
        );
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`xmu:aero:article:${item.link}`, () => fetchArticleContent(item.link!));
            return { ...item, description: detail.description };
        },
        { concurrency: 3 }
    );
    return {
        title: titleMap[type],
        link,
        item: items,
    };
}
