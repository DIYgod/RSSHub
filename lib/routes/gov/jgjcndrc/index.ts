import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jgjcndrc/:id?',
    categories: ['government'],
    example: '/gov/jgjcndrc',
    parameters: { id: '栏目 id，见下表，默认为 692，即通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '价格监测中心',
    maintainers: ['nczitzk'],
    handler,
    description: `| 通知公告 | 中心工作动态 | 地方工作动态 | 监测信息 | 分析预测 | 调查报告 |
  | -------- | ------------ | ------------ | -------- | -------- | -------- |
  | 692      | 693          | 694          | 695      | 696      | 697      |

  | 价格指数 | 地方价格监测 | 价格监测报告制度 | 监测法规 | 媒体聚焦 |
  | -------- | ------------ | ---------------- | -------- | -------- |
  | 698      | 699          | 700              | 701      | 753      |

  #### 监测信息

  | 国内外市场价格监测情况周报 | 主要粮油副食品日报 | 生猪出厂价与玉米价格周报 | 国际市场石油价格每日 动态 |
  | -------------------------- | ------------------ | ------------------------ | ------------------------- |
  | 749                        | 703                | 704                      | 705                       |

  | 非学科类培训服务价格 | 监测周期价格动态 | 月度监测行情表 | 猪料、鸡料、蛋料比价 |
  | -------------------- | ---------------- | -------------- | -------------------- |
  | 821                  | 706              | 707            | 708                  |`,
};

async function handler(ctx) {
    const { id = 'sytzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.jgjcndrc.org.cn';
    const currentUrl = new URL(`list.aspx?clmId=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list_02 li.li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.prev().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.txt_title1').text();
                item.description = content('div#zoom').html();
                item.pubDate = parseDate(content('div.txt_subtitle1').text().trim());

                return item;
            })
        )
    );

    const author = $('title').text();
    const subtitle = $('li.L').first().text();
    const image = new URL($('img.logo2').prop('src'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: author,
        language: $('html').prop('lang'),
        image,
        subtitle,
        author,
    };
}
