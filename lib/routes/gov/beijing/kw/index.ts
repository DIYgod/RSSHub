import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://kw.beijing.gov.cn';

export const route: Route = {
    path: '/kw/:channel{.+}',
    name: '科学技术委员会、中关村科技园区管理委员会',
    example: '/gov/beijing/kw/zwgk/tzgg',
    parameters: { channel: '官网栏目路径，如 zwgk/tzgg；旧 col 编号仍按原地址请求' },
    radar: [
        {
            source: ['kw.beijing.gov.cn/zwgk/tzgg/', 'kw.beijing.gov.cn/zwgk/tzgg/*'],
            target: '/kw/zwgk/tzgg',
        },
        {
            source: ['kw.beijing.gov.cn/col/:channel/index.html'],
            target: '/kw/:channel',
        },
    ],
    maintainers: ['Fatpandac'],
    handler,
    description: `频道参数填写官网栏目 URL 中域名后的路径。如通知公告页面

\`https://kw.beijing.gov.cn/zwgk/tzgg/\` 对应 \`/gov/beijing/kw/zwgk/tzgg\`。

旧版 \`col736\` 等编号仍按原栏目地址请求；官网已移除的旧地址需改用当前栏目路径。`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const limit = getRouteLimit(ctx, 25);
    // Article timestamps can refine the dates on the list page.
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(25, limit);
    const url = `${rootUrl}/${/^col\d+$/.test(channel) ? `col/${channel}/index.html` : `${channel.replace(/\/$/, '')}/`}`;

    const response = await got.get(url);
    const $ = load(response.data);
    const title = $('.crumbs-indexes a').last().text() || $('a.bt_link').last().text().replaceAll('>', '');
    const currentItems = $('.title-list-box ul.list > li');
    let items: DataItem[];
    if (currentItems.length) {
        items = currentItems
            .toArray()
            .slice(0, candidateLimit)
            .map((item) => {
                const node = $(item);
                const anchor = node.find('a');
                const pubDate = node.find('span').text();
                return {
                    title: anchor.attr('title') || anchor.text(),
                    link: new URL(anchor.attr('href')!, url).href,
                    pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) : undefined,
                };
            });
    } else {
        const dataJs = $('div.left.zhengce_right > script[language="javascript"]').html() || $('div.centent_width > script[language="javascript"]').html();
        const entries = dataJs?.match(/urls\[i\]='(.*?)';headers\[i\]="(.*?)";year\[i\]='(\d+)';month\[i\]='(\d+)';day\[i\]='(\d+)';/g) ?? [];
        items = entries.slice(0, candidateLimit).map((item): DataItem => {
            const result = item.match(/urls\[i\]='(.*?)';headers\[i\]="(.*?)";year\[i\]='(\d+)';month\[i\]='(\d+)';day\[i\]='(\d+)';/);
            return {
                title: load(result![2])('a').attr('title') || result![2],
                link: new URL(result![1], rootUrl).href,
                pubDate: timezone(parseDate(`${result![3]}-${result![4]}-${result![5]}`, 'YYYY-MM-DD'), 8),
            };
        });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const content = await got.get(item.link);
                const $ = load(content.data);
                const pubDate = $('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                }
                const article = $('.TRS_UEDITOR').first();
                article.append($('.fujian').html() ?? '');
                item.description = article.html() || $('#zoom').html() || $('div.left.zhengce_right').html();

                return item;
            })
        )
    );

    return {
        title: `北京市科学技术委员会、中关村科技园区管理委员会 - ${title}`,
        link: url,
        item: items,
    };
}
