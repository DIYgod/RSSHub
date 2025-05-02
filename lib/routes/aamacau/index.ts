import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:id?',
    categories: ['new-media'],
    example: '/aamacau',
    parameters: { category: '分类，见下表，默认为即時報道', id: 'id，可在对应页面 URL 中找到，默认为空' },
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
            source: ['aamacau.com/'],
        },
    ],
    name: '话题',
    maintainers: [],
    handler,
    url: 'aamacau.com/',
    description: `| 即時報道     | 每週專題    | 藝文爛鬼樓 | 論盡紙本 | 新聞事件 | 特別企劃 |
| ------------ | ----------- | ---------- | -------- | -------- | -------- |
| breakingnews | weeklytopic | culture    | press    | case     | special  |

::: tip
  除了直接订阅分类全部文章（如 [每週專題](https://aamacau.com/topics/weeklytopic) 的对应路由为 [/aamacau/weeklytopic](https://rsshub.app/aamacau/weeklytopic)），你也可以订阅特定的专题，如 [【9-12】2021 澳門立法會選舉](https://aamacau.com/topics/【9-12】2021澳門立法會選舉) 的对应路由为 [/【9-12】2021 澳門立法會選舉](https://rsshub.app/aamacau/【9-12】2021澳門立法會選舉)。

  分类中的专题也可以单独订阅，如 [新聞事件](https://aamacau.com/topics/case) 中的 [「武漢肺炎」新聞檔案](https://aamacau.com/topics/case/「武漢肺炎」新聞檔案) 对应路由为 [/case/「武漢肺炎」新聞檔案](https://rsshub.app/aamacau/case/「武漢肺炎」新聞檔案)。

  同理，其他分类同上例子也可以订阅特定的单独专题。
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'topics';
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://aamacau.com';
    const currentUrl = `${rootUrl}/${category === 'topics' ? 'topics/breakingnews' : `topics/${category}${id ? `/${id}` : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('post-title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.cat, .author, .date').remove();

                item.description = content('#contentleft').html();
                item.author = content('meta[itemprop="author"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
