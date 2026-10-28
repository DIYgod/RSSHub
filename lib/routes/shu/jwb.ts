import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://jwb.shu.edu.cn/';
const alias = new Map([
    ['notice', 'tzgg'], // 通知公告
    ['news', 'xw'], // 新闻动态
    /* ['policy', 'zcwj'],  政策文件 //BUG */
]);

export const route: Route = {
    path: '/jwb/:type?',
    categories: ['university'],
    example: '/shu/jwb/notice',
    parameters: { type: '消息类型,默认为`notice`' },
    radar: [
        {
            source: ['jwb.shu.edu.cn/index/tzgg.htm'],
            target: '/jwb/notice',
        },
        {
            source: ['jwb.shu.edu.cn/index/xw.htm'],
            target: '/jwb/news',
        },
    ],
    name: '教务部',
    maintainers: ['tuxinghuan', 'GhhG123'],
    handler,
    description: `| 通知通告 | 新闻 | 政策文件 (bug) |
| -------- | ---- | -------------- |
| notice   | news | policy         |`,
};

function restorePdfContent($: CheerioAPI, link: string) {
    $('.v_news_content script').each((_, element) => {
        const script = $(element).html() || '';
        const pdfPath = script.match(/showVsbpdfIframe\(["']([^"']+)["']/)?.[1];
        if (!pdfPath) {
            return;
        }
        const content = $('<div></div>');
        content.append($('<a>PDF</a>').attr('href', new URL(pdfPath, link).href));
        const pagesJson = script.match(/var\s+vsb_pdf_image_data\s*=\s*(\[[\s\S]*?\])/)?.[1];
        const pages: unknown = pagesJson ? JSON.parse(pagesJson) : [];
        if (Array.isArray(pages)) {
            for (const page of pages) {
                if (typeof page === 'string') {
                    content.append($('<img>').attr('src', new URL(page, link).href));
                }
            }
        }
        $(element).replaceWith(content);
    });
}

async function handler(ctx) {
    const type = ctx.req.param('type') || 'notice';
    const link = `https://jwb.shu.edu.cn/index/${alias.get(type) || type}.htm`;
    const respond = await got.get(link);
    const $ = load(respond.data);
    const title = $('title').text();
    const list = $('.only-list')
        .find('li')
        .slice(0, 10)
        .toArray()
        .map((ele): DataItem & { date: string; link: string } => ({
            title: $(ele).find('a').text(),
            link: new URL($(ele).find('a').attr('href')!, host).href,
            date: $(ele).children('span').text(),
        }));

    const all = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`shu:jwb:v3:${item.link}`, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);
                restorePdfContent($, item.link);
                item.author = $('[id$=_lblUser]').text().trim();
                item.description = $('.v_news_content').html() || item.title;
                return { description: item.description, author: item.author };
            });
            return { ...item, ...details, pubDate: timezone(parseDate(item.date, 'YYYY年MM月DD日'), 8) };
        },
        { concurrency: 3 }
    );
    return {
        title,
        link,
        image: 'https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png',
        item: all,
    };
}
