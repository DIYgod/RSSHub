import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const categories = {
    tracker: 123,
    feature: 124,
    opinion: 125,
};

export const route: Route = {
    path: '/news/:category?/:id?',
    categories: ['traditional-media'],
    example: '/now/news',
    parameters: { category: '分类，见下表，默认为首页', id: '编号，可在对应专题/节目页 URL 中找到 topicId' },
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
            source: ['news.now.com/'],
        },
    ],
    name: '新聞',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.now.com/',
    description: `:::tip
  **编号** 仅对事件追蹤、評論節目、新聞專題三个分类起作用，例子如下：

  对于 [事件追蹤](https://news.now.com/home/tracker) 中的 [塔利班奪權](https://news.now.com/home/tracker/detail?catCode=123\&topicId=1056) 话题，其网址为 \`https://news.now.com/home/tracker/detail?catCode=123&topicId=1056\`，其中 \`topicId\` 为 1056，则对应路由为 [\`/now/news/tracker/1056\`](https://rsshub.app/now/news/tracker/1056)
  :::

  | 首頁 | 港聞  | 兩岸國際      | 娛樂          |
  | ---- | ----- | ------------- | ------------- |
  |      | local | international | entertainment |

  | 生活 | 科技       | 財經    | 體育   |
  | ---- | ---------- | ------- | ------ |
  | life | technology | finance | sports |

  | 事件追蹤 | 評論節目 | 新聞專題 |
  | -------- | -------- | -------- |
  | tracker  | feature  | opinion  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') || '';
    const id = ctx.req.param('id') || '';

    const rootUrl = 'https://news.now.com';

    const currentUrl = Object.hasOwn(categories, category) ? `${rootUrl}/home/${category}/detail?catCode=${categories[category]}&topicId=${id}` : `${rootUrl}/home${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $(`${category === '' ? '.homeFeaturedNews ' : '.newsCategoryColLeft '}.newsTitle`)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().parent().attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const images = detailResponse.data.match(/"imageUrl":"(.*?)","image2Url":/);

                item.pubDate = parseDate(content('.published').attr('datetime'));
                item.description = (images ? `<img src="${images[1]}">` : '') + content('.newsLeading').html();

                return item;
            })
        )
    );

    return {
        title: String(Object.hasOwn(categories, category) ? $('title').text() : ($('.smallSpace.active').text() || '首頁') + ' | Now 新聞'),
        link: currentUrl,
        item: items,
    };
}
