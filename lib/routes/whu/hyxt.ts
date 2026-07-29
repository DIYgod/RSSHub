import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { domain, getMeta, processItems, processMeta } from './util';

export const route: Route = {
    path: '/hyxt/:category{.+}?',
    categories: ['university'],
    example: '/whu/hyxt',
    parameters: { category: '分类，见下表，默认为 `tzgg`， 即 **通知公告**' },
    name: '弘毅学堂',
    maintainers: ['nczitzk'],
    handler,
    description: `| 新闻动态 | 通知公告 | 学子风采 | 学术论坛 |
| -------- | -------- | -------- | -------- |
| xwdt     | tzgg     | xzfc     | xslt     |

<details>
  <summary>更多分类</summary>

#### 学堂简报

| 学堂简报 |
| -------- |
| xtjb     |

#### 人才培养

| 人才培养 | 招生工作  | 培养方案  | 科研训练  | 毕业去向  | 学习资源  |
| -------- | --------- | --------- | --------- | --------- | --------- |
| rcpy     | rcpy/zsgz | rcpy/pyfa | rcpy/kyxl | rcpy/byqx | rcpy/xxzy |

#### 学生工作

| 学生工作 | 党团建设  | 学术交流  | 书院生活  | 奖助体系  | 事务服务  |
| -------- | --------- | --------- | --------- | --------- | --------- |
| xsgz     | xsgz/dtjs | xsgz/xsjl | xsgz/sysh | xsgz/jztx | xsgz/swfw |

#### 国际合作

| 国际合作 | 国际交流  | 交流分享  |
| -------- | --------- | --------- |
| gjhz     | gjhz/gjjl | gjhz/jlfx |

#### 校友风采

| 校友风采 |
| -------- |
| xyfc     |

</details>

此外 route 后可以加上 \`?limit=n\` 的查询参数，表示只获取前 n 条内容；如果不指定默认为 30。`,
};

async function handler(ctx) {
    const { category = 'tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = `https://hyxt.${domain}`;
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('tr.content-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('td a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('td').last().text()),
            };
        });

    items = await processItems(items, rootUrl);

    const meta = processMeta(response);
    const siteName = getMeta(meta, 'SiteName');
    const columnName = getMeta(meta, 'ColumnName');

    return {
        item: items,
        title: `${siteName} - ${columnName}`,
        link: currentUrl,
        description: getMeta(meta, 'ColumnKeywords'),
        language: $('html').prop('lang'),
        image: new URL($('div.top-logo img').prop('src'), rootUrl).href,
        subtitle: columnName,
        author: siteName,
        allowEmpty: true,
    };
}
