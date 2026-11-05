import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getArticle(link: string): Promise<Partial<DataItem>> {
    const item: Partial<DataItem> = {};
    const resp = await got.get(link);
    const $ = load(resp.data);
    if ($('.v_news_content').length) {
        const content = $('.v_news_content');
        content
            .closest('form')
            .find('a[href*="DownloadAttachUrl"]')
            .filter((_, elem) => !$(elem).closest('.v_news_content').length)
            .each((_, elem) => {
                const attachment = copyNodes($(elem));
                content.append($('<p>').append(attachment));
            });
        const pdfPath = content
            .find('script')
            .text()
            .match(/showVsbpdfIframe\(["']([^"']+)["']/)?.[1];
        if (pdfPath) {
            item.enclosure_url = new URL(pdfPath, link).href;
            item.enclosure_type = 'application/pdf';
            content.append($('<p>').append($('<a>').attr('href', item.enclosure_url).text('阅读全文（PDF）')));
        }
        item.description = content.html()!;
        const author = $('h2 + div, p.xx')
            .filter((_, elem) => !$(elem).closest('.v_news_content').length)
            .text()
            .match(/作者：([\s\S]*?)(?:[|｜]\s*)?编辑：/)?.[1]
            .trim();
        if (author) {
            item.author = author;
        }
    }
    return item;
}

export const route: Route = {
    path: '/dxy/:code',
    categories: ['university'],
    example: '/swpu/dxy/1156',
    parameters: { code: '栏目代码' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['swpu.edu.cn/'],
            target: '',
        },
    ],
    name: '电气信息学院',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 学院新闻 | 学院通知 |
| ---- | -------- | -------- |
| 代码 | 1122     | 1156     |`,
};

async function handler(ctx): Promise<Data> {
    const code = ctx.req.param('code');
    const currentPath = { '1156': 'sygk/xytz.htm', '1122': 'sygk/xyxw.htm' }[code];
    const url = currentPath ? `https://www.swpu.edu.cn/dxy/${currentPath}` : `https://www.swpu.edu.cn/dxy/list1.jsp?urltype=tree.TreeTempUrl&wbtreeid=${code}`;

    const res = await got.get(url);
    const $ = load(res.data);

    let title = $('title').text();
    title = title.slice(0, title.indexOf('-'));

    // Read the source's current first page and retain the previous layout for other codes.
    const items: DataItem[] = $(currentPath ? '.news-list > ul > li' : 'tr[height="20"]')
        .toArray()
        .map((elem) => {
            const news = $('.news-list-title', elem).length > 0;
            const anchor = $(currentPath ? (news ? '.news-list-title a' : 'a') : 'a[title]', elem);
            const date = currentPath ? (news ? `${$('.news-list-date > span', elem).text()}-${$('.news-list-date .day', elem).text().trim()}` : $('.fr', elem).text()) : $('td:eq(1)', elem).text();
            const publishedAt = date.match(currentPath ? /\d{4}-\d{1,2}-\d{1,2}/ : /\d{4}年\d{1,2}月\d{1,2}日/)?.[0];
            return {
                title: news ? $('p:first-child', anchor).text() : anchor.text(),
                pubDate: publishedAt ? timezone(parseDate(publishedAt, currentPath ? 'YYYY-MM-DD' : 'YYYY年MM月DD日'), 8) : undefined,
                link: new URL(anchor.attr('href')!, url).href,
            };
        });

    const out = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`swpu:dxy:article:v4:${item.link}`, () => getArticle(item.link!))) }), { concurrency: 3 });

    return {
        title: `西南石油大学电气信息学院 ${title}`,
        link: url,
        description: `西南石油大学电气信息学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
}

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
