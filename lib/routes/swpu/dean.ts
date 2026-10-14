import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { joinUrl } from './utils';

async function getArticle(link: string): Promise<Partial<DataItem>> {
    const item: Partial<DataItem> = {};
    const resp = await got.get(link);
    const $ = load(resp.data);
    if ($('.v_news_content').length) {
        const content = $('.v_news_content');
        content
            .closest('form, .content_redhead')
            .find('a[href*="DownloadAttachUrl"]')
            .filter((_, elem) => !$(elem).closest('.v_news_content').length)
            .each((_, elem) => {
                const attachment = copyNodes($(elem));
                content.append($('<p>').append(attachment));
            });
        item.description = content.html()!;
        const date = $('#lbDate').text();
        if (date.trim()) {
            item.pubDate = timezone(parseDate(date, '更新时间：YYYY年MM月DD日'), 8);
        }
        const author = $('.detailShowAEA')
            .text()
            .match(/作者：([\s\S]*?)｜\s*编辑：/)?.[1]
            .trim();
        if (author) {
            item.author = author;
        }
    }
    return item;
}

export const route: Route = {
    path: '/dean/:code',
    categories: ['university'],
    example: '/swpu/dean/tzgg',
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
    name: '教务处',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 通知公告 | 新闻报道 | 视点声音 |
| ---- | -------- | -------- | -------- |
| 代码 | tzgg     | xwbd     | sdsy     |`,
};

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/dean/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const currentTemplate = $('.list-right-column .list-ul').length > 0;
    let title = currentTemplate ? $('title').text().split('-', 1)[0] : $('.r_list > h3').text();
    title = title.slice(title.indexOf('：') + 1);

    // Read the current first page, retaining support for the previous layout.
    const items: DataItem[] = $(currentTemplate ? '.list-right-column .list-ul > li' : '.r_list > ul > li')
        .toArray()
        .map((elem) => ({
            title: $(currentTemplate ? 'a' : 'label:eq(0)', elem).text(),
            pubDate: currentTemplate && $('.list-date', elem).text().trim() ? timezone(parseDate($('.list-date', elem).text(), 'YYYY-MM-DD'), 8) : undefined,
            link: joinUrl('https://www.swpu.edu.cn/dean/', $('a', elem).attr('href')),
        }));

    const out = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`swpu:dean:article:v3:${item.link}`, () => getArticle(item.link!))) }), { concurrency: 3 });

    return {
        title: `西南石油大学教务处 ${title}`,
        link: url,
        description: `西南石油大学教务处 ${title}`,
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
