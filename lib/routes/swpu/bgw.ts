import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { joinUrl } from './utils';

export const route: Route = {
    path: '/bgw/:code',
    categories: ['university'],
    example: '/swpu/bgw/zytzgg',
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
    name: '办公网',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 重要通知公告 | 部门通知公告 | 本周活动 |
| ---- | ------------ | ------------ | -------- |
| 代码 | zytzgg       | bmtzgg       | bzhd     |`,
};

async function getArticle(link: string): Promise<Pick<DataItem, 'author' | 'description'>> {
    const details: Pick<DataItem, 'author' | 'description'> = {};
    const resp = await got.get(link);
    const $ = load(resp.data);
    const content = $('.v_news_content');
    if (!content.length) {
        return details;
    }
    content
        .closest('form')
        .find('a[href*="DownloadAttachUrl"]')
        .filter((_, elem) => !$(elem).closest('.v_news_content').length)
        .each((_, elem) => {
            const attachment = copyNodes($(elem));
            content.append($('<p>').append(attachment));
        });
    details.description = content.html();
    const author = content
        .closest('form')
        .find('h1 + div')
        .text()
        .match(/作者：([\s\S]*?)审核：/)?.[1]
        .trim();
    if (author) {
        details.author = author;
    }

    return details;
}

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/bgw/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const title = $('.title').text();

    // 获取标题、时间及链接
    const items: Array<DataItem & { link: string }> = $('.notice > ul > li > a')
        .toArray()
        .map((elem) => ({
            title: $(elem.children[0]).text(),
            pubDate: $(elem.children[1]).text().trim() ? timezone(parseDate($(elem.children[1]).text()), 8) : undefined,
            link: joinUrl('https://www.swpu.edu.cn', $(elem).attr('href')), // 实际获得连接 "../info/1312/17891.htm"
        }));

    // 请求全文
    const out = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`swpu:bgw:article:v4:${item.link}`, () => getArticle(item.link))),
        }),
        { concurrency: 3 }
    );

    return {
        title: `西南石油大学办公网 ${title}`,
        link: url,
        description: `西南石油大学办公网 ${title} 列表`,
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
