import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { id = 'tzgg' } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl = 'http://due.hitsz.edu.cn';
    let targetUrl;

    // 根据不同的分类设置目标URL
    if (id === 'tzgg') {
        targetUrl = new URL('index/tzggqb.htm', baseUrl).href;
    } else if (id === 'jwdt') {
        targetUrl = new URL('index/jwdtqb.htm', baseUrl).href;
    } else {
        targetUrl = new URL(`${id}/list.htm`, baseUrl).href;
    }

    const response = await got(targetUrl);
    const $ = load(response.data);

    let items = [];

    // 提取新闻列表项
    items = $('ul.list-main-modular li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el = $(el);

            const title = $el.find('span.text-over').text().trim();
            const linkUrl = $el.find('a').attr('href') || '';
            const pubDateStr = $el.find('label').text().trim();

            return {
                title,
                pubDate: timezone(parseDate(pubDateStr), 8),
                link: new URL(linkUrl, baseUrl).href,
            };
        });

    // 获取详细内容
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $$ = load(detailResponse.data);

                const title = $$('h1.arti_title, h2.arti_title, title').text();
                const content = $$('div.wp_articlecontent, div.article-content').html();
                const pubDateStr = $$('span.arti_update, .publish-time').text().split(/：/).pop()?.trim();

                return {
                    ...item,
                    title: title || item.title,
                    description: content,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
                };
            })
        )
    );

    const title = $('title').text();
    const author = '哈尔滨工业大学（深圳）教务部';

    return {
        title: `${author} - ${title}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
    };
};

export const route: Route = {
    path: '/hitsz/due/:id?',
    name: '教务部',
    url: 'due.hitsz.edu.cn',
    maintainers: ['hlmu', 'nczitzk'],
    handler,
    example: '/hitsz/due/tzgg',
    parameters: {
        category: {
            description: '分类，默认为 `tzgg`，即通知公告，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '通知公告',
                    value: 'tzgg',
                },
                {
                    label: '教务动态',
                    value: 'jwdt',
                },
            ],
        },
    },
    description: `:::tip
订阅 [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm)，其源网址为 \`http://due.hitsz.edu.cn/index/tzggqb.htm\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/hitsz/due/tzgg\`](https://rsshub.app/hitsz/due/tzgg)。
:::

<details>
  <summary>更多栏目</summary>

| 栏目 | ID |
| - | - |
| [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm) | [tzgg](https://rsshub.app/hitsz/due/tzgg) |
| [教务动态](http://due.hitsz.edu.cn/index/jwdtqb.htm) | [jwdt](https://rsshub.app/hitsz/due/jwdt) |

</details>
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
            source: ['due.hitsz.edu.cn', 'due.hitsz.edu.cn/index/:id/list.htm'],
            target: (params) => {
                const id: string = params.id;
                return `/hitsz/due${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '通知公告',
            source: ['due.hitsz.edu.cn/index/tzggqb.htm'],
            target: '/hitsz/due/tzgg',
        },
        {
            title: '教务动态',
            source: ['due.hitsz.edu.cn/index/jwdtqb.htm'],
            target: '/hitsz/due/jwdt',
        },
    ],
};
