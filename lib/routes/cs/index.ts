import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const decodeBufferByCharset = (buffer) => {
    const isGBK = /charset="?'?gb/i.test(buffer.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    return iconv.decode(buffer, encoding);
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '栏目',
    parameters: { category: '分类，见下表，默认为首页' },
    maintainers: ['nczitzk'],
    description: `| 要闻 | 公司 | 市场 | 基金 |
| ---- | ---- | ---- | ---- |
| xwzx | ssgs | gppd | tzjj |

| 科创 | 产经   | 期货     | 海外   |
| ---- | ------ | -------- | ------ |
| 5g   | cj2020 | zzqh2020 | hw2020 |

<details>
<summary>更多栏目</summary>

#### 要闻

| 财经要闻 | 观点评论 | 民生消费  |
| -------- | -------- | --------- |
| xwzx/hg  | xwzx/jr  | xwzx/msxf |

#### 公司

| 公司要闻  | 公司深度  | 公司巡礼  |
| --------- | --------- | --------- |
| ssgs/gsxw | ssgs/gssd | ssgs/gsxl |

#### 市场

| A 股市场  | 港股资讯  | 债市研究  | 海外报道  | 期货报道  |
| --------- | --------- | --------- | --------- | --------- |
| gppd/gsyj | gppd/ggzx | gppd/zqxw | gppd/hwbd | gppd/qhbd |

#### 基金

| 基金动态  | 基金视点  | 基金持仓  | 私募基金  | 基民学苑  |
| --------- | --------- | --------- | --------- | --------- |
| tzjj/jjdt | tzjj/jjks | tzjj/jjcs | tzjj/smjj | tzjj/tjdh |

#### 机构

| 券商 | 银行 | 保险 |
| ---- | ---- | ---- |
| qs   | yh   | bx   |

#### 其他

| 中证快讯 7x24 | IPO 鉴真 | 公司能见度 |
| ------------- | -------- | ---------- |
| sylm/jsbd     | yc/ipojz | yc/gsnjd   |
</details>`,
    handler,
};

async function handler(ctx) {
    const { category = 'xwzx' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.cs.com.cn';
    const currentUrl = new URL(category.endsWith('/') ? category : `${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(decodeBufferByCharset(response));

    let items = $('ul.ch_type3_list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h3').text().trim(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('em').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const content = load(decodeBufferByCharset(detailResponse));

                    item.title = content('article.cont_article header h1').text().trim();
                    item.description = content('article.cont_article section').html();
                    item.author = content('div.artc_info em').text().trim();
                    item.category = content('div.artc_route div a')
                        .slice(1)
                        .toArray()
                        .map((c) => content(c).prop('title') ?? content(c).text());
                    item.pubDate = timezone(parseDate(content('.time').prop('datetime')), +8);
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('div.logo_cs a img').prop('src'), currentUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author: title.split('-').pop().trim(),
    };
}
