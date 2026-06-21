import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import shortcuts from './shortcuts';

export const route: Route = {
    path: '/:path{.+}?',
    name: '通用',
    example: '/gov/nsfc',
    parameters: { path: '路径，默认为基金要闻' },
    maintainers: ['Derekmini', 'nczitzk'],
    handler,
    description: `::: tip

若订阅 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab442)，网址为 <https://www.nsfc.gov.cn/publish/portal0/tab442>。截取 \`https://www.nsfc.gov.cn\` 到末尾的部分 \`/publish/portal0/tab442\` 作为参数，此时路由为 [\`/gov/nsfc/publish/portal0/tab442\`](https://rsshub.app/gov/nsfc/publish/portal0/tab442)。

当然，也可以填入路径在下表中对应的快捷方式。其中 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab442) 的快捷方式为 \`tzgg\`，此时路由为 [\`/gov/nsfc/tzgg\`](https://rsshub.app/gov/nsfc/tzgg)。

若订阅 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab1212)，网址为 <https://www.nsfc.gov.cn/publish/portal0/tab1212>。截取 \`https://www.nsfc.gov.cn\` 到末尾的部分 \`/publish/portal0/tab1212\` 作为参数，此时路由为 [\`/gov/nsfc/publish/portal0/tab1212\`](https://rsshub.app/gov/nsfc/publish/portal0/tab1212)。

同理，也可以填入路径在下表中对应的快捷方式。其中 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab1212) 的快捷方式为 \`glkxb-tzgg\`，此时路由为 [\`/gov/nsfc/glkxb-tzgg\`](https://rsshub.app/gov/nsfc/glkxb-tzgg)。

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

async function handler(ctx) {
    const path = ctx.req.param('path');
    let thePath = path ? `/${path}` : '';

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const shortcutMatches = thePath.match(/(\/news)?\/([\w-]+)/);

    if (shortcutMatches) {
        const shortcut = shortcutMatches[2];
        if (Object.hasOwn(shortcuts, shortcut)) {
            thePath = shortcuts[shortcut];
        }
    }

    const rootUrl = 'https://www.nsfc.gov.cn';
    const currentUrl = new URL((thePath.endsWith('/more') ? `${thePath}.htm` : thePath) || 'publish/portal0/tab442/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('span.fl a, ul.dp_lia li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') ?? item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                guid: `nsfc-${item.prop('id')}`,
                pubDate: parseDate(item.next().text().replace(/\[\]/g, '', ['YYYY-MM-DD', 'YY-MM-DD'])),
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
                        .match(/日期 (\d{4}-\d{2}-\d{2})/)[1]
                );

                return item;
            })
        )
    );

    return {
        item: items,
        title: `国家自然科学基金委员会 - ${$('#ess_essBREADCRUMB_lblBreadCrumb a.break')
            .toArray()
            .slice(1)
            .map((a) => $(a).text())
            .join(' - ')}`,
        link: currentUrl,
        description: $('meta[name="DESCRIPTION"]').prop('content'),
        language: 'zh-cn',
        subtitle: $('meta[name="KEYWORDS"]').prop('content'),
        author: $('meta[name="AUTHOR"]').prop('content'),
    };
}
