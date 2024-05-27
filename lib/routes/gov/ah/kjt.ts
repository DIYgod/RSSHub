import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'kjzx/tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://kjt.ah.gov.cn';
    const currentUrl = new URL(`${category.replace(/\/$/, '').replace(/\/index\.html$/, '')}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.doc_list li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            const title = a.prop('title') ?? a.text();

            return {
                title,
                pubDate: parseDate(item.find('span.date').text()),
                link: a.prop('href'),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const description = $$('div.wzcon').html();

                item.title = $$('meta[name="ArticleTitle"]').prop('content');
                item.description = description;
                item.pubDate = timezone(parseDate($$('meta[name="PubDate"]').prop('content')), +8);
                item.category = [
                    ...new Set([
                        $$('meta[name="ColumnName"]').prop('content'),
                        $$('meta[name="ColumnType"]').prop('content'),
                        $$('meta[name="ColumnKeywords"]').prop('content'),
                        $$('meta[name="ContentSource"]').prop('content'),
                        $$('meta[name="ContentSource"]').prop('content'),
                    ]),
                ].filter(Boolean);
                item.author = $$('meta[name="Author"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div.wzcon').text(),
                };
                item.updated = timezone(parseDate($$('meta[name="HtmlGenerateTime"]').prop('content')), +8);
                item.language = language;

                return item;
            })
        )
    );

    const author = $('meta[name="SiteName"]').prop('content');
    const image = $('span.img_title').first().prev().prop('src');

    return {
        title: `${author} - ${$('meta[name="ColumnName"]').prop('content')}`,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/ah/kjt/:category{.+}?',
    name: '安徽省科学技术厅',
    url: 'kjt.ah.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/ah/kjt',
    parameters: { category: '分类，默认为 `kjzx/tzgg`，即通知公告，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [通知公告](https://kjt.ah.gov.cn/kjzx/tzgg/)，网址为 \`https://kjt.ah.gov.cn/kjzx/tzgg/\`。截取 \`https://kjt.ah.gov.cn/\` 到末尾 \`/\` 的部分 \`\` 作为参数填入，此时路由为 [\`/gov/ah/kjt/kjzx/tzgg\`](https://rsshub.app/gov/ah/kjt/kjzx/tzgg)。
  :::

  #### [科技资讯](https://kjt.ah.gov.cn/kjzx/index.html)

  | [通知公告](https://kjt.ah.gov.cn/kjzx/tzgg/index.html) | [工作动态](https://kjt.ah.gov.cn/kjzx/gzdt/index.html) | [基层科技](https://kjt.ah.gov.cn/kjzx/jckj/index.html) | [媒体聚焦](https://kjt.ah.gov.cn/kjzx/mtjj/index.html) |
  | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
  | [kjzx/tzgg](https://rsshub.app/gov/ah/kjt/kjzx/tzgg)   | [kjzx/gzdt](https://rsshub.app/gov/ah/kjt/kjzx/gzdt)   | [kjzx/jckj](https://rsshub.app/gov/ah/kjt/kjzx/jckj)   | [kjzx/mtjj](https://rsshub.app/gov/ah/kjt/kjzx/mtjj)   |
  
  | [重要转载](https://kjt.ah.gov.cn/kjzx/zyzz/index.html) | [图片视频](https://kjt.ah.gov.cn/kjzx/tpsp/index.html) |
  | ------------------------------------------------------ | ------------------------------------------------------ |
  | [kjzx/zyzz](https://rsshub.app/gov/ah/kjt/kjzx/zyzz)   | [kjzx/tpsp](https://rsshub.app/gov/ah/kjt/kjzx/tpsp)   |

  #### [科技统计](https://kjt.ah.gov.cn/kjzy/kjtj/index.html)

  | [技术市场交易](https://kjt.ah.gov.cn/kjzy/kjtj/jsscjy/index.html)  | [科技成果公报](https://kjt.ah.gov.cn/kjzy/kjtj/kjcggb/index.html)  | [孵化载体发展](https://kjt.ah.gov.cn/kjzy/kjtj/cyfhfz/index.html)  |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
  | [kjzy/kjtj/jsscjy](https://rsshub.app/gov/ah/kjt/kjzy/kjtj/jsscjy) | [kjzy/kjtj/kjcggb](https://rsshub.app/gov/ah/kjt/kjzy/kjtj/kjcggb) | [kjzy/kjtj/cyfhfz](https://rsshub.app/gov/ah/kjt/kjzy/kjtj/cyfhfz) |

  #### [科技数据](https://kjt.ah.gov.cn/kjzy/kjsj/index.html)

  | [创新企业](https://kjt.ah.gov.cn/kjzy/kjsj/cxqy/index.html)    | [创新项目](https://kjt.ah.gov.cn/kjzy/kjsj/cxxm/index.html)    | [创新成果](https://kjt.ah.gov.cn/kjzy/kjsj/cxcg/index.html)    | [转化基金入库项目](https://kjt.ah.gov.cn/kjzy/kjsj/zhjjrkxm/index.html) |
  | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
  | [kjzy/kjsj/cxqy](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxqy) | [kjzy/kjsj/cxxm](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxxm) | [kjzy/kjsj/cxcg](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxcg) | [kjzy/kjsj/zhjjrkxm](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/zhjjrkxm)  |

  | [创新平台](https://kjt.ah.gov.cn/kjzy/kjsj/cxpt/index.html)    | [创新园区](https://kjt.ah.gov.cn/kjzy/kjsj/cxyq/index.html)    | [创新许可](https://kjt.ah.gov.cn/kjzy/kjsj/cxxk/index.html)    |
  | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
  | [kjzy/kjsj/cxpt](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxpt) | [kjzy/kjsj/cxyq](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxyq) | [kjzy/kjsj/cxxk](https://rsshub.app/gov/ah/kjt/kjzy/kjsj/cxxk) |

  `,
    categories: ['government'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kjt.ah.gov.cn/:category'],
            target: (params) => {
                const category = params.category;

                return `/gov/ah/kjt${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '科技资讯 - 通知公告',
            source: ['kjt.ah.gov.cn/kjzx/tzgg/index.html'],
            target: '/ah/kjt/kjzx/tzgg',
        },
        {
            title: '科技资讯 - 工作动态',
            source: ['kjt.ah.gov.cn/kjzx/gzdt/index.html'],
            target: '/ah/kjt/kjzx/gzdt',
        },
        {
            title: '科技资讯 - 基层科技',
            source: ['kjt.ah.gov.cn/kjzx/jckj/index.html'],
            target: '/ah/kjt/kjzx/jckj',
        },
        {
            title: '科技资讯 - 媒体聚焦',
            source: ['kjt.ah.gov.cn/kjzx/mtjj/index.html'],
            target: '/ah/kjt/kjzx/mtjj',
        },
        {
            title: '科技资讯 - 重要转载',
            source: ['kjt.ah.gov.cn/kjzx/zyzz/index.html'],
            target: '/ah/kjt/kjzx/zyzz',
        },
        {
            title: '科技资讯 - 图片视频',
            source: ['kjt.ah.gov.cn/kjzx/tpsp/index.html'],
            target: '/ah/kjt/kjzx/tpsp',
        },
        {
            title: '科技统计 - 技术市场交易',
            source: ['kjt.ah.gov.cn/kjzy/kjtj/jsscjy/index.html'],
            target: '/ah/kjt/kjzy/kjtj/jsscjy',
        },
        {
            title: '科技统计 - 科技成果公报',
            source: ['kjt.ah.gov.cn/kjzy/kjtj/kjcggb/index.html'],
            target: '/ah/kjt/kjzy/kjtj/kjcggb',
        },
        {
            title: '科技统计 - 孵化载体发展',
            source: ['kjt.ah.gov.cn/kjzy/kjtj/cyfhfz/index.html'],
            target: '/ah/kjt/kjzy/kjtj/cyfhfz',
        },
        {
            title: '科技数据 - 创新企业',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxqy/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxqy',
        },
        {
            title: '科技数据 - 创新项目',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxxm/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxxm',
        },
        {
            title: '科技数据 - 创新成果',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxcg/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxcg',
        },
        {
            title: '科技数据 - 转化基金入库项目',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/zhjjrkxm/index.html'],
            target: '/ah/kjt/kjzy/kjsj/zhjjrkxm',
        },
        {
            title: '科技数据 - 创新平台',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxpt/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxpt',
        },
        {
            title: '科技数据 - 创新园区',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxyq/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxyq',
        },
        {
            title: '科技数据 - 创新许可',
            source: ['kjt.ah.gov.cn/kjzy/kjsj/cxxk/index.html'],
            target: '/ah/kjt/kjzy/kjsj/cxxk',
        },
    ],
};
