import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { currentCategoryPaths, getCurrentItems } from './utils';

const decodeBufferByCharset = (buffer) => {
    const isGBK = /charset="?'?gb/i.test(buffer.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    return iconv.decode(buffer, encoding);
};

export const route: Route = {
    path: '/:category{.+}?',
    categories: ['finance'],
    example: '/cs',
    name: '栏目',
    parameters: { category: '分类，见下表，默认为要闻' },
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
            title: '要闻',
            source: ['cs.com.cn/xwzx/', 'cs.com.cn/yaowen.html'],
            target: '/xwzx',
        },
        {
            title: '公司',
            source: ['cs.com.cn/ssgs/', 'cs.com.cn/gongsi.html'],
            target: '/ssgs',
        },
        {
            title: '市场',
            source: ['cs.com.cn/gppd/', 'cs.com.cn/shichang.html'],
            target: '/gppd',
        },
        {
            title: '基金',
            source: ['cs.com.cn/tzjj/', 'cs.com.cn/jijin.html'],
            target: '/tzjj',
        },
        {
            title: '科创',
            source: ['cs.com.cn/5g/'],
            target: '/5g',
        },
        {
            title: '产经',
            source: ['cs.com.cn/cj2020/', 'cs.com.cn/ssgs/cj2020/list.html'],
            target: '/cj2020',
        },
        {
            title: '期货',
            source: ['cs.com.cn/zzqh2020/', 'cs.com.cn/zzqh2020/list.html'],
            target: '/zzqh2020',
        },
        {
            title: '海外',
            source: ['cs.com.cn/hw2020/', 'cs.com.cn/hw2020/list.html'],
            target: '/hw2020',
        },
        {
            title: '财经要闻',
            source: ['cs.com.cn/xwzx/hg/', 'cs.com.cn/xwzx/01/list.html'],
            target: '/xwzx/hg',
        },
        {
            title: '观点评论',
            source: ['cs.com.cn/xwzx/jr/', 'cs.com.cn/xwzx/jr/list.html'],
            target: '/xwzx/jr',
        },
        {
            title: '民生消费',
            source: ['cs.com.cn/xwzx/msxf/', 'cs.com.cn/xwzx/msxf/list.html'],
            target: '/xwzx/msxf',
        },
        {
            title: '公司要闻',
            source: ['cs.com.cn/ssgs/gsxw/', 'cs.com.cn/ssgs/01/list.html'],
            target: '/ssgs/gsxw',
        },
        {
            title: '公司深度',
            source: ['cs.com.cn/ssgs/gssd/', 'cs.com.cn/ssgs/gssd/list.html'],
            target: '/ssgs/gssd',
        },
        {
            title: '公司巡礼',
            source: ['cs.com.cn/ssgs/gsxl/', 'cs.com.cn/ssgs/07/list.html'],
            target: '/ssgs/gsxl',
        },
        {
            title: 'A股市场',
            source: ['cs.com.cn/gppd/gsyj/', 'cs.com.cn/gppd/gsyj/list.html'],
            target: '/gppd/gsyj',
        },
        {
            title: '港股资讯',
            source: ['cs.com.cn/gppd/ggzx/', 'cs.com.cn/gppd/ggzx/list.html'],
            target: '/gppd/ggzx',
        },
        {
            title: '债市研究',
            source: ['cs.com.cn/gppd/zqxw/', 'cs.com.cn/gppd/zqxw/list.html'],
            target: '/gppd/zqxw',
        },
        {
            title: '海外报道',
            source: ['cs.com.cn/gppd/hwbd/', 'cs.com.cn/hw2020/list.html'],
            target: '/gppd/hwbd',
        },
        {
            title: '期货报道',
            source: ['cs.com.cn/gppd/qhbd/', 'cs.com.cn/zzqh2020/list.html'],
            target: '/gppd/qhbd',
        },
        {
            title: '基金动态',
            source: ['cs.com.cn/tzjj/jjdt/', 'cs.com.cn/tzjj/01/list.html'],
            target: '/tzjj/jjdt',
        },
        {
            title: '基金视点',
            source: ['cs.com.cn/tzjj/jjks/', 'cs.com.cn/tzjj/03/list.html'],
            target: '/tzjj/jjks',
        },
        {
            title: '基金持仓',
            source: ['cs.com.cn/tzjj/jjcs/', 'cs.com.cn/tzjj/jjcs/list.html'],
            target: '/tzjj/jjcs',
        },
        {
            title: '私募基金',
            source: ['cs.com.cn/tzjj/smjj/', 'cs.com.cn/tzjj/smjj/list.html'],
            target: '/tzjj/smjj',
        },
        {
            title: '基民学苑',
            source: ['cs.com.cn/tzjj/tjdh/', 'cs.com.cn/tzjj/tjdh/list.html'],
            target: '/tzjj/tjdh',
        },
        {
            title: '券商',
            source: ['cs.com.cn/qs/', 'cs.com.cn/quanshang.html'],
            target: '/qs',
        },
        {
            title: '银行',
            source: ['cs.com.cn/yh/', 'cs.com.cn/yh/list.html'],
            target: '/yh',
        },
        {
            title: '保险',
            source: ['cs.com.cn/bx/', 'cs.com.cn/bx/list.html'],
            target: '/bx',
        },
        {
            title: '中证快讯 7x24',
            source: ['cs.com.cn/sylm/jsbd/', 'cs.com.cn/sylm/jsbd/list.html'],
            target: '/sylm/jsbd',
        },
        {
            title: 'IPO鉴真',
            source: ['cs.com.cn/yc/ipojz/', 'cs.com.cn/IPO.html'],
            target: '/yc/ipojz',
        },
        {
            title: '公司能见度',
            source: ['cs.com.cn/yc/gsnjd/', 'cs.com.cn/gsnjd.html'],
            target: '/yc/gsnjd',
        },
    ],
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
    url: 'www.cs.com.cn',
};

async function handler(ctx) {
    const { category = 'xwzx' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.cs.com.cn';
    const categoryPath = currentCategoryPaths[category] ?? (category.endsWith('/') || category.endsWith('.html') ? category : `${category}/`);
    const currentUrl = new URL(categoryPath, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(decodeBufferByCharset(response));

    const usesCurrentData = $('script[src$="/mi4_page_articles_guide.js"]').length > 0;
    let items = usesCurrentData
        ? await getCurrentItems($, currentUrl)
        : $('ul.ch_type3_list li a')
              .toArray()
              .map((item): DataItem & { link: string } => {
                  const $item = $(item);

                  return {
                      title: $item.find('h3').text().trim(),
                      link: new URL($item.prop('href')!, currentUrl).href,
                      pubDate: timezone(parseDate($item.find('em').text()), 8),
                  };
              });

    if (ctx.req.query('sorted') !== 'false' && (usesCurrentData || ctx.req.query('limit'))) {
        items = items.toSorted((a, b) => Number(b.pubDate) - Number(a.pubDate));
    }
    items = items.slice(0, limit);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const content = load(decodeBufferByCharset(detailResponse));

                    const detailTitle = content('article.cont_article header h1').text().trim();
                    item.title = detailTitle || item.title;
                    item.description = content('article.cont_article section').html() || item.description;
                    item.author = content('div.artc_info em').text().trim() || item.author;
                    const detailCategories = content('div.artc_route div a')
                        .slice(1)
                        .toArray()
                        .map((c) => content(c).prop('title') ?? content(c).text());
                    if (detailCategories.length) {
                        item.category = detailCategories;
                    }
                    const publishedAt = content('.time').prop('datetime') || content('.artc_info time').prop('datetime') || content('.artc_info time').text().trim();
                    if (publishedAt) {
                        const parsedDate = parseDate(publishedAt);
                        item.pubDate = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(publishedAt) ? parsedDate : timezone(parsedDate, 8);
                    }
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const imageSrc = $('div.logo_cs a img').prop('src') || $('link[rel="shortcut icon"], link[rel="icon"]').first().attr('href');
    const image = imageSrc ? new URL(imageSrc, currentUrl).href : undefined;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="Description"], meta[name="description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author: title.split('-').pop()!.trim(),
    };
}
