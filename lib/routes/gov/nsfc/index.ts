import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import shortcuts from './shortcuts';

export const route: Route = {
    path: '/:path{.+}?',
    name: '通用',
    example: '/gov/nsfc',
    parameters: { path: '路径，默认为通知公告' },
    maintainers: ['Derekmini', 'nczitzk'],
    handler,
    description: `::: tip

若订阅 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/p1/3381/2822/tzsm1.html)，网址为 <https://www.nsfc.gov.cn/p1/3381/2822/tzsm1.html>。截取 \`https://www.nsfc.gov.cn\` 到末尾的部分 \`/p1/3381/2822/tzsm1.html\` 作为参数，此时路由为 [\`/gov/nsfc/p1/3381/2822/tzsm1.html\`](https://rsshub.app/gov/nsfc/p1/3381/2822/tzsm1.html)。

当然，也可以填入路径在下表中对应的快捷方式。其中 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/p1/3381/2822/tzsm1.html) 的快捷方式为 \`tzgg\`，此时路由为 [\`/gov/nsfc/tzgg\`](https://rsshub.app/gov/nsfc/tzgg)。

若订阅 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/p1/2857/3203/glkxbtzgg.html)，网址为 <https://www.nsfc.gov.cn/p1/2857/3203/glkxbtzgg.html>。截取 \`https://www.nsfc.gov.cn\` 到末尾的部分 \`/p1/2857/3203/glkxbtzgg.html\` 作为参数，此时路由为 [\`/gov/nsfc/p1/2857/3203/glkxbtzgg.html\`](https://rsshub.app/gov/nsfc/p1/2857/3203/glkxbtzgg.html)。

同理，也可以填入路径在下表中对应的快捷方式。其中 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/p1/2857/3203/glkxbtzgg.html) 的快捷方式为 \`glkxb-tzgg\`，此时路由为 [\`/gov/nsfc/glkxb-tzgg\`](https://rsshub.app/gov/nsfc/glkxb-tzgg)。

:::

基金要闻

| 基金要闻 | 通知公告 | 部门动态 | 科普快讯 | 资助成果 |
| -------- | -------- | -------- | -------- | -------- |
| jjyw     | tzgg     | bmdt     | kpkx     | zzcg     |

政策法规

| 国家自然科学基金条例 | 国家自然科学基金发展规划 | 国家自然科学基金规章制度 | 国家科学技术相关法律法规 |
| -------------------- | ------------------------ | ------------------------ | ------------------------ |
| zcfg-jjtl            | zcfg-fzgh                | zcfg-gzzd                | zcfg-flfg                |

管理科学部

| 工作动态   | 通知公告   | 资助成果   |
| ---------- | ---------- | ---------- |
| glkxb-gzdt | glkxb-tzgg | glkxb-zzcg |

国际合作局

| 项目指南   | 初审结果   | 批准通知   | 进程简表   | 信息公开   |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| gjhzj-xmzn | gjhzj-csjg | gjhzj-pztz | gjhzj-jcjb | gjhzj-xxgk |`,
};

const currentPaths = {
    '/publish/portal0/tab440': '/p1/3381/2821/jjyw11.html',
    '/publish/portal0/tab442': '/p1/3381/2822/tzsm1.html',
    '/publish/portal0/tab445': '/p1/3381/2823/bmdt.html',
    '/publish/portal0/tab448': '/p1/3381/2825/zzcg11.html',
    '/publish/portal0/tab471': '/p1/2871/2873/gjzrkxjjtl.html',
    '/publish/portal0/tab475': '/p1/2871/2874/gjzrkxjjgzzd.html',
    '/publish/portal0/tab609': '/p1/2871/2872/gjkxjsxgflfg.html',
    '/publish/portal0/tab1210': '/p1/2857/3202/glkxbgzdt.html',
    '/publish/portal0/tab1212': '/p1/2857/3203/glkxbtzgg.html',
    '/publish/portal0/tab1213': '/p1/2857/3204/glkxbzzcg.html',
    '/publish/portal0/tab1366': '/p1/2828/2833/jcjb.html',
} satisfies Record<string, string>;

const isLegacyPath = (key: string): key is keyof typeof currentPaths => Object.hasOwn(currentPaths, key);

async function handler(ctx) {
    const path = ctx.req.param('path');
    let thePath = path ? `/${path}` : '';

    const limit = Math.max(30, getRouteLimit(ctx, 30));

    const shortcutMatches = thePath.match(/^(\/news)?\/([\w-]+)\/?$/);

    if (shortcutMatches) {
        const shortcut = shortcutMatches[2];
        if (Object.hasOwn(shortcuts, shortcut)) {
            thePath = shortcuts[shortcut];
        }
    }

    const rootUrl = 'https://www.nsfc.gov.cn';
    const legacyPath = thePath.replace(/\/$/, '') || '/publish/portal0/tab442';
    thePath = isLegacyPath(legacyPath) ? currentPaths[legacyPath] : thePath;
    const currentUrl = `${rootUrl}${thePath.endsWith('/more') ? `${thePath}.htm` : thePath}`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    if (thePath.startsWith('/p1/')) {
        const items = $('.wzy-ul a.wzy-box-c, .list .item-left > a, .zcfg-item-ul a, .sciences-content-right-content > a, .bmdt-list > a')
            .slice(0, limit)
            .toArray()
            .map((element): DataItem & { link: string } => {
                const $item = $(element);
                const title = $item.find('.item-left-title, .item-right-content, .bmdt-title').text() || $item.text();
                const listDate = $item
                    .closest('.item-left')
                    .find('.item-left-time')
                    .text()
                    .match(/(\d{2}-\d{2})\s*\/(\d{4})/);
                const dateText = $item.find('.date').text() || $item.closest('.wzy-item').find('.wzy-item-time > div:last-child').text() || (listDate ? `${listDate[2]}-${listDate[1]}` : '');
                return {
                    title,
                    link: new URL($item.prop('href')!, currentUrl).href,
                    ...(dateText && { pubDate: timezone(parseDate(dateText), 8) }),
                };
            });

        return {
            title: `国家自然科学基金委员会 - ${$('.szyw, .sciences-content-right-title').first().text()}`,
            link: currentUrl,
            language: 'zh-CN' as const satisfies Language,
            item: await pMap(
                items,
                async (item) => {
                    if (new URL(item.link).pathname.endsWith('.pdf')) {
                        return { ...item, enclosure_url: item.link, enclosure_type: 'application/pdf' };
                    }
                    return await cache.tryGet(item.link, async () => {
                        const { data: detailResponse } = await got(item.link);
                        const content = load(detailResponse);
                        const dateText = content('.detail-introduce > div').first().find('span').text();
                        const wechatTimestamp = content('script')
                            .text()
                            .match(/\bvar\s+ct\s*=\s*["'](\d+)["']/)?.[1];
                        content('#js_content img[data-src]').each((_, image) => {
                            content(image).attr('src', content(image).attr('data-src')!);
                        });
                        return {
                            ...item,
                            title: content('.detail-title, #activity-name').text() || item.title,
                            description: content('.detail-p, .main-body, #js_content').html(),
                            author: content('.detail-introduce > div').eq(2).find('span').text() || content('#js_name').text() || undefined,
                            category: [content('.detail-introduce > div').eq(1).find('span').text()].filter(Boolean),
                            ...(wechatTimestamp ? { pubDate: parseDate(wechatTimestamp, 'X') } : dateText && { pubDate: timezone(parseDate(dateText), 8) }),
                        };
                    });
                },
                { concurrency: 3 }
            ),
        };
    }

    let items = $('span.fl a, ul.dp_lia li a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.prop('title') ?? $item.text(),
                link: new URL($item.prop('href')!, rootUrl).href,
                guid: `nsfc-${$item.prop('id')}`,
                pubDate: parseDate($item.next().text().replaceAll('[]', '')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.title_xilan').text();
                item.description = content('#zoom').html();
                item.author = content('meta[name="docauthor"]').prop('content');
                item.category = [content('meta[name="channel"]').prop('content'), content('meta[name="docsource"]').prop('content')];
                item.pubDate = parseDate(
                    content('div.line_xilan')
                        .text()
                        .match(/日期 (\d{4}-\d{2}-\d{2})/)![1]
                );

                return item;
            })
        )
    );

    return {
        item: items,
        title: `国家自然科学基金委员会 - ${$('#ess_essBREADCRUMB_lblBreadCrumb a.break')
            .slice(1)
            .toArray()
            .map((a) => $(a).text())
            .join(' - ')}`,
        link: currentUrl,
        description: $('meta[name="DESCRIPTION"]').prop('content'),
        language: 'zh-CN' as const satisfies Language,
        subtitle: $('meta[name="KEYWORDS"]').prop('content'),
        author: $('meta[name="AUTHOR"]').prop('content'),
    };
}
