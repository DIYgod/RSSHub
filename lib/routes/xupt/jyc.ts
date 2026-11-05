import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

async function fetchDetails(url: string) {
    const response = await ofetch(url);
    const $ = load(response);
    const content = $('.v_news_content').first();
    const attachments = $('form[name="_newscontent_fromname"] a[href*="DownloadAttachUrl"]')
        .filter((_, link) => !$(link).closest('.v_news_content').length)
        .toArray()
        .map((link) => `<li>${$.html(link)}</li>`)
        .join('');

    return {
        description: `${content.html() ?? ''}${attachments ? `<ul>${attachments}</ul>` : ''}` || undefined,
    };
}

export const route: Route = {
    path: '/jyc/:type?',
    categories: ['university'],
    example: '/xupt/jyc',
    parameters: { type: '分类，默认为 tzgg（通知公告）' },
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
            source: ['jyc.xupt.edu.cn/index/tzgg.htm'],
            target: '/jyc/tzgg',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['StudyingLover'],
    handler,
    description: `| 分类     | 参数 |
| -------- | ---- |
| 通知公告 | tzgg |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'tzgg';
    const typeDict = {
        tzgg: ['通知公告', 'https://jyc.xupt.edu.cn/index/tzgg.htm'],
    };

    const [typeName, url] = typeDict[type] || typeDict.tzgg;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.ej_list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();

            // Resolve source relative article links.
            const linkHref = $link.attr('href') || '';
            const absoluteLink = new URL(linkHref, 'https://jyc.xupt.edu.cn').href;

            // The list calendar label supplies only month and day.
            // Do not infer a year or a source timezone from this list label.

            return {
                title: $link.text(),
                link: absoluteLink,
            };
        })
        .filter((item) => item.title && item.link);

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link, () => fetchDetails(item.link));
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: `西安邮电大学教务处 - ${typeName}`,
        link: url,
        item: items,
    };
}
