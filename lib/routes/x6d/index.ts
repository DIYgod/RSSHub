import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://xd.x6d.com';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/x6d/34',
    parameters: { id: '分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
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
};

async function handler(ctx) {
    const { id = 'latest' } = ctx.req.param();

    const currentUrl = id === 'latest' ? baseUrl : `${baseUrl}/html/${id}.html`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    $('i.rj').remove();

    const query =
        id === 'latest'
            ? $('#newslist ul')
                  .eq(0)
                  .find('li')
                  .not('.addd')
                  .find('a')
                  .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 22)
            : $('a.soft-title').slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10);

    const list = query.toArray().map((item) => {
        item = $(item);
        return {
            title: item.text(),
            link: `${baseUrl}${item.attr('href')}`,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);

                item.description = content('div.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text()), 8);

                return item;
            })
        )
    );

    return {
        title: `小刀娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
}
