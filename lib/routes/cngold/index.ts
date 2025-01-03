import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'news-325' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12;

    const rootUrl = 'https://www.cngold.org.cn';
    const currentUrl = new URL(`${category}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.newsList li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('t1').text(),
                pubDate: parseDate(item.find('div.min, div.day').text(), ['YYYY-MM-DD', 'MM-DD']),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.details_top div.t1').text();
                const description = $$('div.details_con').html();

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('div.details_top div.min span').first().text());
                item.author = $$('div.details_top div.min span').last().text().split(/：/).pop();
                item.content = {
                    html: description,
                    text: $$('div.details_con').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('div.logo img').prop('src'), rootUrl).href;

    return {
        title: `${$('title').text()} - ${$('div.tab a.current').text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="keywords"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '分类',
    url: 'www.cngold.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/cngold/news-325',
    parameters: { category: '分类，默认为 `news-325`，即行业资讯，可在对应分类页 URL 中找到, Category, `news-325`，即行业资讯by default' },
    description: `::: tip
  若订阅 [行业资讯](https://www.cngold.org.cn/news-325.html)，网址为 \`https://www.cngold.org.cn/news-325.html\`。截取 \`https://www.cngold.org.cn/\` 到末尾 \`.html\` 的部分 \`news-325\` 作为参数填入，此时路由为 [\`/cngold/news-325\`](https://rsshub.app/cngold/news-325)。
:::

  #### 资讯中心

  | [图片新闻](https://www.cngold.org.cn/news-323.html) | [通知公告](https://www.cngold.org.cn/news-324.html) | [党建工作](https://www.cngold.org.cn/news-326.html) | [行业资讯](https://www.cngold.org.cn/news-325.html) | [黄金矿业](https://www.cngold.org.cn/news-327.html) | [黄金消费](https://www.cngold.org.cn/news-328.html) |
  | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
  | [news-323](https://rsshub.app/cngold/news-323)      | [news-324](https://rsshub.app/cngold/news-324)      | [news-326](https://rsshub.app/cngold/news-326)      | [news-325](https://rsshub.app/cngold/news-325)      | [news-327](https://rsshub.app/cngold/news-327)      | [news-328](https://rsshub.app/cngold/news-328)      |

  | [黄金市场](https://www.cngold.org.cn/news-329.html) | [社会责任](https://www.cngold.org.cn/news-330.html) | [黄金书屋](https://www.cngold.org.cn/news-331.html) | [工作交流](https://www.cngold.org.cn/news-332.html) | [黄金统计](https://www.cngold.org.cn/news-333.html) | [协会动态](https://www.cngold.org.cn/news-334.html) |
  | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
  | [news-329](https://rsshub.app/cngold/news-329)      | [news-330](https://rsshub.app/cngold/news-330)      | [news-331](https://rsshub.app/cngold/news-331)      | [news-332](https://rsshub.app/cngold/news-332)      | [news-333](https://rsshub.app/cngold/news-333)      | [news-334](https://rsshub.app/cngold/news-334)      |

  <details>
    <summary>更多分类</summary>

  #### [政策法规](https://www.cngold.org.cn/policies.html)

  | [法律法规](https://www.cngold.org.cn/policies-245.html) | [产业政策](https://www.cngold.org.cn/policies-262.html) | [黄金标准](https://www.cngold.org.cn/policies-281.html) |
  | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
  | [policies-245](https://rsshub.app/cngold/policies-245)  | [policies-262](https://rsshub.app/cngold/policies-262)  | [policies-281](https://rsshub.app/cngold/policies-281)  |

  #### [行业培训](https://www.cngold.org.cn/training.html)

  | [黄金投资分析师](https://www.cngold.org.cn/training-242.html) | [教育部1+X](https://www.cngold.org.cn/training-246.html) | [矿业权评估师](https://www.cngold.org.cn/training-338.html) | [其他培训](https://www.cngold.org.cn/training-247.html) |
  | ------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
  | [training-242](https://rsshub.app/cngold/training-242)        | [training-246](https://rsshub.app/cngold/training-246)   | [training-338](https://rsshub.app/cngold/training-338)      | [training-247](https://rsshub.app/cngold/training-247)  |

  #### [黄金科技](https://www.cngold.org.cn/technology.html)

  | [黄金协会科学技术奖](https://www.cngold.org.cn/technology-318.html) | [科学成果评价](https://www.cngold.org.cn/technology-319.html) | [新技术推广](https://www.cngold.org.cn/technology-320.html) | [黄金技术大会](https://www.cngold.org.cn/technology-350.html) |
  | ------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
  | [technology-318](https://rsshub.app/cngold/technology-318)          | [technology-319](https://rsshub.app/cngold/technology-319)    | [technology-320](https://rsshub.app/cngold/technology-320)  | [technology-350](https://rsshub.app/cngold/technology-350)    |

  </details>
    `,
    categories: ['new-media'],

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
            source: ['www.cngold.org.cn/:category?'],
            target: (params) => {
                const category = params.category;

                return category ? `/${category}` : '';
            },
        },
        {
            title: '政策法规 - 法律法规',
            source: ['www.cngold.org.cn/policies-245.html'],
            target: '/policies-245',
        },
        {
            title: '政策法规 - 产业政策',
            source: ['www.cngold.org.cn/policies-262.html'],
            target: '/policies-262',
        },
        {
            title: '政策法规 - 黄金标准',
            source: ['www.cngold.org.cn/policies-281.html'],
            target: '/policies-281',
        },
        {
            title: '行业培训 - 黄金投资分析师',
            source: ['www.cngold.org.cn/training-242.html'],
            target: '/training-242',
        },
        {
            title: '行业培训 - 教育部1+X',
            source: ['www.cngold.org.cn/training-246.html'],
            target: '/training-246',
        },
        {
            title: '行业培训 - 矿业权评估师',
            source: ['www.cngold.org.cn/training-338.html'],
            target: '/training-338',
        },
        {
            title: '行业培训 - 其他培训',
            source: ['www.cngold.org.cn/training-247.html'],
            target: '/training-247',
        },
        {
            title: '黄金科技 - 黄金协会科学技术奖',
            source: ['www.cngold.org.cn/technology-318.html'],
            target: '/technology-318',
        },
        {
            title: '黄金科技 - 科学成果评价',
            source: ['www.cngold.org.cn/technology-319.html'],
            target: '/technology-319',
        },
        {
            title: '黄金科技 - 新技术推广',
            source: ['www.cngold.org.cn/technology-320.html'],
            target: '/technology-320',
        },
        {
            title: '黄金科技 - 黄金技术大会',
            source: ['www.cngold.org.cn/technology-350.html'],
            target: '/technology-350',
        },
    ],
};
