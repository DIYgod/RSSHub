import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    name: '分类',
    url: 'xd.x6d.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/x6d/34',
    parameters: { id: '分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新' },
    description: `| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |
  | -------- | ------- | -------- | -------- | -------- |
  | 31       | 55      | 112      | 33       | 88       |

  | 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- |
  | 18       | 98       | 94       | 93       | 99       | 100      | 21       | 22       | 19         | 44       |

  | 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 34       | 35       | 91       | 92       | 39       | 38       | 37       | 36       |

  | 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |
  | -------- | -------- | -------- | -------- |
  | 65       | 50       | 77       | 101      |

  | 值得一听 | 每日一听 | 歌单推荐 |
  | -------- | -------- | -------- |
  | 71       | 87       | 79       |

  | 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 106      | 107      | 108      | 109      | 110      | 111      | 113      |`,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

export async function handler(ctx) {
    const { id = 'latest' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 22;

    const rootUrl = 'https://xd.x6d.com';

    let currentUrl = new URL(id === 'latest' ? '' : `html/${id}.html`, rootUrl).href;

    const { data: firstResponse } = await got(currentUrl);

    let $;

    if (/<meta\s/.test(firstResponse)) {
        $ = load(firstResponse);
    } else {
        currentUrl = new URL(
            id === 'latest'
                ? ''
                : firstResponse
                      .match(/'([\w./=?]+)'/g)
                      .reverse()
                      .join('')
                      .replaceAll("'", ''),
            rootUrl
        ).href;

        const { data: response } = await got(currentUrl);

        $ = load(response);
    }

    $('i.rj').remove();

    const language = 'zh';

    const query = id === 'latest' ? $('#newslist ul').first().find('li').not('li.addd').find('a').slice(0, limit) : $('a.soft-title').slice(0, limit);

    let items = query.toArray().map((item) => {
        item = $(item);

        return {
            title: item.prop('title') ?? item.text(),
            link: new URL(item.prop('href'), rootUrl).href,
            language,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.article-title').text();
                const description = $$('div.article-content').html();
                const image = new URL($$('div.article-content img').first().prop('src'), rootUrl).href;

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('time').text()), +8);
                item.category = $$('b.bq-wg')
                    .toArray()
                    .map((c) => $$(c).text());
                item.author = $$('span.bq-zz').text();
                item.content = {
                    html: description,
                    text: $$('div.article-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('div.header-logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text().split(/\s-/)[0],
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        language,
    };
}
