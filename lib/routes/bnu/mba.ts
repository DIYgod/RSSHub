import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'xwdt' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://mba.bnu.edu.cn';
    const currentUrl = new URL(`${category.replace(/\/$/, '')}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.concrcc li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.listlj');
            const title = a.text();

            return {
                title,
                pubDate: parseDate(item.find('div.crq').text()),
                link: new URL(a.prop('href'), currentUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.connewst').text();
                const description = $$('div.concrczw').html();
                const image = $$('div.concrczw img').first().prop('src');

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('div.connewstis-time').text().split(/：/).pop());
                item.content = {
                    html: description,
                    text: $$('div.concrczw').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            })
        )
    );

    const author = $('title').text();
    const image = new URL('images/logo5.png', rootUrl).href;

    return {
        title: `${author} - ${$('div.concrchbt').text()}`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/mba/:category{.+}?',
    name: '经济与工商管理学院MBA',
    url: 'mba.bnu.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/bnu/mba/xwdt',
    parameters: { category: '分类，默认为 xwdt，即新闻聚焦' },
    description: `::: tip
  若订阅 [新闻聚焦](https://mba.bnu.edu.cn/xwdt/index.html)，网址为 \`https://mba.bnu.edu.cn/xwdt/index.html\`。截取 \`https://mba.bnu.edu.cn/\` 到末尾 \`/index.html\` 的部分 \`xwdt\` 作为参数填入，此时路由为 [\`/bnu/mba/xwdt\`](https://rsshub.app/bnu/mba/xwdt)。
:::

  #### [主页](https://mba.bnu.edu.cn)

  | [新闻聚焦](https://mba.bnu.edu.cn/xwdt/index.html) | [通知公告](https://mba.bnu.edu.cn/tzgg/index.html) | [MBA 系列讲座](https://mba.bnu.edu.cn/mbaxljz/index.html) |
  | -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
  | [xwdt](https://rsshub.app/bnu/mba/xwdt)            | [tzgg](https://rsshub.app/bnu/mba/tzgg)            | [mbaxljz](https://rsshub.app/bnu/mba/mbaxljz)             |

  #### [招生动态](https://mba.bnu.edu.cn/zsdt/zsjz/index.html)

  | [下载专区](https://mba.bnu.edu.cn/zsdt/cjwt/index.html) |
  | ------------------------------------------------------- |
  | [zsdt/cjwt](https://rsshub.app/bnu/mba/zsdt/cjwt)       |

  #### [国际视野](https://mba.bnu.edu.cn/gjhz/hwjd/index.html)

  | [海外基地](https://mba.bnu.edu.cn/gjhz/hwjd/index.html) | [学位合作](https://mba.bnu.edu.cn/gjhz/xwhz/index.html) | [长期交换](https://mba.bnu.edu.cn/gjhz/zqjh/index.html) | [短期项目](https://mba.bnu.edu.cn/gjhz/dqxm/index.html) |
  | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
  | [gjhz/hwjd](https://rsshub.app/bnu/mba/gjhz/hwjd)       | [gjhz/xwhz](https://rsshub.app/bnu/mba/gjhz/xwhz)       | [gjhz/zqjh](https://rsshub.app/bnu/mba/gjhz/zqjh)       | [gjhz/dqxm](https://rsshub.app/bnu/mba/gjhz/dqxm)       |

  #### [校园生活](https://mba.bnu.edu.cn/xysh/xszz/index.html)

  | [学生组织](https://mba.bnu.edu.cn/xysh/xszz/index.html) |
  | ------------------------------------------------------- |
  | [xysh/xszz](https://rsshub.app/bnu/mba/xysh/xszz)       |

  #### [职业发展](https://mba.bnu.edu.cn/zyfz/xwds/index.html)

  | [校外导师](https://mba.bnu.edu.cn/zyfz/xwds/index.html) | [企业实践](https://mba.bnu.edu.cn/zyfz/zycp/index.html) | [就业创业](https://mba.bnu.edu.cn/zyfz/jycy/index.html) |
  | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
  | [zyfz/xwds](https://rsshub.app/bnu/mba/zyfz/xwds)       | [zyfz/zycp](https://rsshub.app/bnu/mba/zyfz/zycp)       | [zyfz/jycy](https://rsshub.app/bnu/mba/zyfz/jycy)       |
  `,
    categories: ['university'],

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
            source: ['mba.bnu.edu.cn/:category?'],
            target: (params) => {
                const category = params.category;

                return category ? `/${category.replace(/\/index\.html$/, '')}` : '';
            },
        },
        {
            title: '新闻聚焦',
            source: ['mba.bnu.edu.cn/xwdt/index.html'],
            target: '/mba/xwdt',
        },
        {
            title: '通知公告',
            source: ['mba.bnu.edu.cn/tzgg/index.html'],
            target: '/mba/tzgg',
        },
        {
            title: 'MBA系列讲座',
            source: ['mba.bnu.edu.cn/mbaxljz/index.html'],
            target: '/mba/mbaxljz',
        },
        {
            title: '招生动态 - 下载专区',
            source: ['mba.bnu.edu.cn/zsdt/cjwt/index.html'],
            target: '/mba/zsdt/cjwt',
        },
        {
            title: '国际视野 - 海外基地',
            source: ['mba.bnu.edu.cn/gjhz/hwjd/index.html'],
            target: '/mba/gjhz/hwjd',
        },
        {
            title: '国际视野 - 学位合作',
            source: ['mba.bnu.edu.cn/gjhz/xwhz/index.html'],
            target: '/mba/gjhz/xwhz',
        },
        {
            title: '国际视野 - 长期交换',
            source: ['mba.bnu.edu.cn/gjhz/zqjh/index.html'],
            target: '/mba/gjhz/zqjh',
        },
        {
            title: '国际视野 - 短期项目',
            source: ['mba.bnu.edu.cn/gjhz/dqxm/index.html'],
            target: '/mba/gjhz/dqxm',
        },
        {
            title: '校园生活 - 学生组织',
            source: ['mba.bnu.edu.cn/xysh/xszz/index.html'],
            target: '/mba/xysh/xszz',
        },
        {
            title: '职业发展 - 校外导师',
            source: ['mba.bnu.edu.cn/zyfz/xwds/index.html'],
            target: '/mba/zyfz/xwds',
        },
        {
            title: '职业发展 - 企业实践',
            source: ['mba.bnu.edu.cn/zyfz/zycp/index.html'],
            target: '/mba/zyfz/zycp',
        },
        {
            title: '职业发展 - 就业创业',
            source: ['mba.bnu.edu.cn/zyfz/jycy/index.html'],
            target: '/mba/zyfz/jycy',
        },
    ],
};
