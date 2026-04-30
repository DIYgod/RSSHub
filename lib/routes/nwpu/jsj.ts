import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jsj/:channelId?',
    categories: ['university'],
    example: '/nwpu/jsj/1599',
    parameters: { channelId: '栏目 ID，默认为 1599（通知公告）' },
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
            source: ['jsj.nwpu.edu.cn/snew/list.jsp'],
            target: '/jsj/1599',
        },
    ],
    name: '计算机学院通知公告',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const channelId = ctx.req.param('channelId') || '1599';
    const baseUrl = 'https://jsj.nwpu.edu.cn';
    const listUrl = `${baseUrl}/snew/list.jsp`;

    const response = await ofetch(listUrl, {
        query: {
            urltype: 'tree.TreeTempUrl',
            wbtreeid: channelId,
        },
    });

    const $ = load(response);

    // 内容在 <ul> 下的 <li> 中，格式为: <li><span>日期</span><a href="...">标题</a></li>
    const items = $('div.cno-right > ul > li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const span = $el.find('span');
            const a = $el.find('a');
            const dateText = span.text().trim();
            // 链接格式: ../info/1599/29115.htm
            const href = a.attr('href');
            if (!href) {
                return null;
            }
            // 转换为完整 URL: https://jsj.nwpu.edu.cn/info/1599/29115.htm
            const link = `${baseUrl}/${href.replaceAll('../', '')}`;

            return {
                title: a.text().trim(),
                link,
                pubDate: dateText ? parseDate(dateText) : undefined,
            };
        })
        .filter((item): item is { title: string; link: string; pubDate: Date | undefined } => item !== null && !!item.title);

    return {
        title: '西北工业大学计算机学院通知公告',
        link: `${baseUrl}/snew/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${channelId}`,
        item: items,
    };
}
