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
    path: '/scs/:code',
    categories: ['university'],
    example: '/swpu/scs/tzgg',
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
            title: '计算机与软件学院 - 通知公告',
            source: ['www.swpu.edu.cn/scs/index/tzgg.htm'],
            target: '/scs/tzgg',
        },
        {
            title: '计算机与软件学院 - 新闻速递',
            source: ['www.swpu.edu.cn/scs/index/xwsd.htm'],
            target: '/scs/xwsd',
        },
    ],
    name: '计算机与软件学院',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 通知公告 | 新闻速递 |
| ---- | -------- | -------- |
| 代码 | tzgg     | xwsd     |`,
};

async function getArticle(link: string): Promise<Pick<DataItem, 'author' | 'description' | 'updated' | 'enclosure_url' | 'enclosure_type'>> {
    const details: Pick<DataItem, 'author' | 'description' | 'updated' | 'enclosure_url' | 'enclosure_type'> = {};
    const resp = await got.get(link);
    const $ = load(resp.data);
    if (!$('title').text().startsWith('系统提示')) {
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
            details.enclosure_url = new URL(pdfPath, link).href;
            details.enclosure_type = 'application/pdf';
            content.append($('<p>').append($('<a>').attr('href', details.enclosure_url).text('阅读全文（PDF）')));
        }
        details.description = content.html();
        const author = $('.article-abstract span')
            .filter((_, elem) => $(elem).text().startsWith('文章作者：'))
            .text()
            .slice('文章作者：'.length)
            .trim();
        if (author) {
            details.author = author;
        }
    }

    const modifiedDate = $('.main_conRa > p')
        .toArray()
        .map((elem) =>
            $(elem)
                .text()
                .match(/^更新时间：(\d{4}-\d{2}-\d{2})/)
        )
        .find(Boolean);
    if (modifiedDate) {
        details.updated = timezone(parseDate(modifiedDate[1], 'YYYY-MM-DD'), 8);
    }

    return details;
}

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/scs/index/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const title = $('.r_list > h3').text() || $('title').text().split('-', 1)[0];

    // Extract titles, source dates, and links from the listing.
    const items: Array<DataItem & { link: string }> = $('.main_conRCb > ul > li')
        .toArray()
        .map((elem) => ({
            title: $('em', elem).text(),
            ...(/\d{4}-\d{2}-\d{2}/.test($('span', elem).text()) && { pubDate: timezone(parseDate($('span', elem).text(), 'YYYY-MM-DD'), 8) }),
            link: joinUrl('https://www.swpu.edu.cn/scs/index/', $('a', elem).attr('href')),
        }));

    // Fetch the main article content.
    const out = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`swpu:scs:article:v6:${item.link}`, () => getArticle(item.link))),
        }),
        { concurrency: 3 }
    );

    return {
        title: `西南石油大学计算机与软件学院 ${title}`,
        link: url,
        description: `西南石油大学计算机与软件学院 ${title}`,
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
