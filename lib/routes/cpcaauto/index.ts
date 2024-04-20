import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { type = 'news', id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'http://cpcaauto.com';
    const currentUrl = new URL(`news.php${type ? `?types=${type}${id ? `&anid=${id}` : ''}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = 'zh';

    let items = $('div.list_d ul li.q')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text(),
                pubDate: parseDate(item.find('span').text().trim()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.tit').text();
                const description = $$('div.text').html();

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('div.view span').first().text().split(/：/).pop()), +8);
                item.content = {
                    html: description,
                    text: $$('div.text').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('meta[property="og:image"]').prop('content'), rootUrl).href;

    return {
        title: `${$('title').text()} - ${$('span.main_color')
            .toArray()
            .map((a) => $(a).text())
            .join(' - ')}`,
        description: $('META[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="keywords"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/news/:type?/:id?',
    name: '文章',
    url: 'cpcaauto.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/cpcaauto/news/news',
    parameters: { type: '分类，默认为 news，可在对应分类页 URL 中找到', id: 'id，默认为 news，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [行业新闻 > 国内乘用车](http://cpcaauto.com/news.php?types=news&anid=10)，网址为 \`http://cpcaauto.com/news.php?types=news&anid=10\`。截取 \`types\` 和 \`anid\` 的部分 \`\` 作为参数填入，此时路由为 [\`/cpcaauto/news/news/10\`](https://rsshub.app/cpcaauto/news/news/10)。
  :::

  #### [行业新闻](http://cpcaauto.com/news.php?types=news)

  | [国内乘用车](http://cpcaauto.com/news.php?types=news&anid=10) | [进口及国外乘用车](http://cpcaauto.com/news.php?types=news&anid=64) | [后市场](http://cpcaauto.com/news.php?types=news&anid=44) | [商用车](http://cpcaauto.com/news.php?types=news&anid=62) |
  | ----------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
  | [news/10](https://rsshub.app/cpcaauto/news/news/10)              | [news/64](https://rsshub.app/cpcaauto/news/news/64)                    | [news/44](https://rsshub.app/cpcaauto/news/news/44)          | [news/62](https://rsshub.app/cpcaauto/news/news/62)          |

  #### [车市解读](http://cpcaauto.com/news.php?types=csjd)

  | [周度](http://cpcaauto.com/news.php?types=csjd&anid=128) | [月度](http://cpcaauto.com/news.php?types=csjd&anid=129) | [指数](http://cpcaauto.com/news.php?types=csjd&anid=130) | [预测](http://cpcaauto.com/news.php?types=csjd&anid=131) |
  | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | [csjd/128](https://rsshub.app/cpcaauto/news/csjd/128)       | [csjd/129](https://rsshub.app/cpcaauto/news/csjd/129)       | [csjd/130](https://rsshub.app/cpcaauto/news/csjd/130)       | [csjd/131](https://rsshub.app/cpcaauto/news/csjd/131)       |

  #### [发布会报告](http://cpcaauto.com/news.php?types=bgzl)

  | [上海市场上牌数](http://cpcaauto.com/news.php?types=bgzl&anid=119) | [京城车市](http://cpcaauto.com/news.php?types=bgzl&anid=122) | [进口车市场分析](http://cpcaauto.com/news.php?types=bgzl&anid=120) | [二手车市场分析](http://cpcaauto.com/news.php?types=bgzl&anid=121) | [价格指数](http://cpcaauto.com/news.php?types=bgzl&anid=124) |
  | ---------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
  | [bgzl/119](https://rsshub.app/cpcaauto/news/bgzl/119)                 | [bgzl/122](https://rsshub.app/cpcaauto/news/bgzl/122)           | [bgzl/120](https://rsshub.app/cpcaauto/news/bgzl/120)                 | [bgzl/121](https://rsshub.app/cpcaauto/news/bgzl/121)                 | [bgzl/124](https://rsshub.app/cpcaauto/news/bgzl/124)           |

  | [热点评述](http://cpcaauto.com/news.php?types=bgzl&anid=125) | [新能源月报](http://cpcaauto.com/news.php?types=bgzl&anid=126) | [商用车月报](http://cpcaauto.com/news.php?types=bgzl&anid=127) | [政策分析](http://cpcaauto.com/news.php?types=bgzl&anid=123) |
  | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
  | [bgzl/125](https://rsshub.app/cpcaauto/news/bgzl/125)           | [bgzl/126](https://rsshub.app/cpcaauto/news/bgzl/126)             | [bgzl/127](https://rsshub.app/cpcaauto/news/bgzl/127)             | [bgzl/123](https://rsshub.app/cpcaauto/news/bgzl/123)           |

  #### [经济与政策](http://cpcaauto.com/news.php?types=meeting)

  | [一周经济](http://cpcaauto.com/news.php?types=meeting&anid=46) | [一周政策](http://cpcaauto.com/news.php?types=meeting&anid=47) |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
  | [meeting/46](https://rsshub.app/cpcaauto/news/meeting/46)         | [meeting/47](https://rsshub.app/cpcaauto/news/meeting/47)         |

  #### [乘联会论坛](http://cpcaauto.com/news.php?types=yjsy)

  | [论坛文章](http://cpcaauto.com/news.php?types=yjsy&anid=49) | [两会](http://cpcaauto.com/news.php?types=yjsy&anid=111) | [车展看点](http://cpcaauto.com/news.php?types=yjsy&anid=113) |
  | --------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
  | [yjsy/49](https://rsshub.app/cpcaauto/news/yjsy/49)            | [yjsy/111](https://rsshub.app/cpcaauto/news/yjsy/111)       | [yjsy/113](https://rsshub.app/cpcaauto/news/yjsy/113)           |
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
            source: ['cpcaauto.com/news.php'],
            target: (_, url) => {
                url = new URL(url);
                const types = url.searchParams.get('types');
                const id = url.searchParams.get('id');

                return types ? `/${types}${id ? `/${id}` : ''}` : '';
            },
        },
        {
            title: '行业新闻 - 国内乘用车',
            source: ['cpcaauto.com/news.php?types=news&anid=10'],
            target: '/news/news/10',
        },
        {
            title: '行业新闻 - 进口及国外乘用车',
            source: ['cpcaauto.com/news.php?types=news&anid=64'],
            target: '/news/news/64',
        },
        {
            title: '行业新闻 - 后市场',
            source: ['cpcaauto.com/news.php?types=news&anid=44'],
            target: '/news/news/44',
        },
        {
            title: '行业新闻 - 商用车',
            source: ['cpcaauto.com/news.php?types=news&anid=62'],
            target: '/news/news/62',
        },
        {
            title: '车市解读 - 周度',
            source: ['cpcaauto.com/news.php?types=csjd&anid=128'],
            target: '/news/csjd/128',
        },
        {
            title: '车市解读 - 月度',
            source: ['cpcaauto.com/news.php?types=csjd&anid=129'],
            target: '/news/csjd/129',
        },
        {
            title: '车市解读 - 指数',
            source: ['cpcaauto.com/news.php?types=csjd&anid=130'],
            target: '/news/csjd/130',
        },
        {
            title: '车市解读 - 预测',
            source: ['cpcaauto.com/news.php?types=csjd&anid=131'],
            target: '/news/csjd/131',
        },
        {
            title: '发布会报告 - 上海市场上牌数',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=119'],
            target: '/news/bgzl/119',
        },
        {
            title: '发布会报告 - 京城车市',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=122'],
            target: '/news/bgzl/122',
        },
        {
            title: '发布会报告 - 进口车市场分析',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=120'],
            target: '/news/bgzl/120',
        },
        {
            title: '发布会报告 - 二手车市场分析',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=121'],
            target: '/news/bgzl/121',
        },
        {
            title: '发布会报告 - 价格指数',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=124'],
            target: '/news/bgzl/124',
        },
        {
            title: '发布会报告 - 热点评述',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=125'],
            target: '/news/bgzl/125',
        },
        {
            title: '发布会报告 - 新能源月报',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=126'],
            target: '/news/bgzl/126',
        },
        {
            title: '发布会报告 - 商用车月报',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=127'],
            target: '/news/bgzl/127',
        },
        {
            title: '发布会报告 - 政策分析',
            source: ['cpcaauto.com/news.php?types=bgzl&anid=123'],
            target: '/news/bgzl/123',
        },
        {
            title: '经济与政策 - 一周经济',
            source: ['cpcaauto.com/news.php?types=meeting&anid=46'],
            target: '/news/meeting/46',
        },
        {
            title: '经济与政策 - 一周政策',
            source: ['cpcaauto.com/news.php?types=meeting&anid=47'],
            target: '/news/meeting/47',
        },
        {
            title: '乘联会论坛 - 论坛文章',
            source: ['cpcaauto.com/news.php?types=yjsy&anid=49'],
            target: '/news/yjsy/49',
        },
        {
            title: '乘联会论坛 - 两会',
            source: ['cpcaauto.com/news.php?types=yjsy&anid=111'],
            target: '/news/yjsy/111',
        },
        {
            title: '乘联会论坛 - 车展看点',
            source: ['cpcaauto.com/news.php?types=yjsy&anid=113'],
            target: '/news/yjsy/113',
        },
    ],
};
