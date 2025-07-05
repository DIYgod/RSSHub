import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const mainCategories = {
    local: 119,
    international: 120,
    entertainment: 500,
    life: 501,
    technology: 502,
    finance: 121,
};

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
            source: ['news.now.com/home/:category?', 'news.now.com/'],
            target: '/news/:category?',
        },
    ],
    name: '新聞',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.now.com/',
    description: `::: tip
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
    const { category = '', id = '' } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') || '20', 10);
    const hasTopicId = id && Object.hasOwn(categories, category);

    const rootUrl = 'https://news.now.com';

    const pageUrl = hasTopicId ? `${rootUrl}/home/${category}/detail?catCode=${categories[category]}&topicId=${id}` : `${rootUrl}/home${category ? `/${category}` : ''}`;

    let apiUrl;
    if (hasTopicId) {
        apiUrl = pageUrl;
    } else if (category === 'sports') {
        apiUrl = `https://sportsapi.now.com/api/getNewsList?pageSize=${limit}&pageNo=1&searchTagsKey=allSportsSearchTags`;
    } else if (category) {
        apiUrl = `https://d3sli7vh0lsda4.cloudfront.net/api/getNewsList?category=${mainCategories[category]}&pageNo=1&pageSize=${limit}`;
    } else {
        apiUrl = pageUrl;
    }

    const response = await ofetch(apiUrl);
    const isApi = typeof response === 'object' && Array.isArray(response);
    const $ = load(response);

    let list;
    if (isApi) {
        list =
            category === 'sports'
                ? response.map((item) => {
                      const image = item.newsPhotos
                          ?.filter((p) => p.sizeType === '3')
                          ?.map((p) => `<img src="${p.imageFileUrl}">`)
                          .join('');
                      return {
                          title: item.headlineChi,
                          description: image,
                          link: `https://news.now.com/home/${category}/player?newsId=${item.newsId}`,
                          pubDate: parseDate(item.publishDate, 'x'),
                          category: [...item.sportTypes.map((t) => t.sportTypeNameChi), ...item.players.map((p) => p.playerFullNameChi), ...item.teams.map((t) => t.teamCodeChi)],
                          image: item.newsPhotos?.filter((p) => p.sizeType === '3')?.[0]?.imageUrl,
                          newsId: item.newsId,
                      };
                  })
                : response.map((item) => {
                      const image = item.image2Url ?? item.imageUrl ?? item.image3Url;
                      return {
                          title: item.title,
                          description: (image ? `<img src="${image}">` : '') + item.leading + item.summary,
                          link: `https://news.now.com/home/${category}/player?newsId=${item.newsId}`,
                          pubDate: parseDate(item.publishDate, 'x'),
                          updated: parseDate(item.lastModifyDate, 'x'),
                          category: item.newsTags.map((t) => t.tag),
                          image,
                      };
                  });
    } else {
        list = $(`${category === '' ? '.homeFeaturedNews ' : '.newsCategoryColLeft '}.newsTitle`)
            .toArray()
            .slice(0, limit)
            .map((item) => {
                item = $(item);

                return {
                    title: item.text(),
                    link: `${rootUrl}${item.parent().parent().attr('href')}`,
                };
            });
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.pubDate || item.newsId) {
                    const detailResponse = await ofetch(item.link);
                    const $ = load(detailResponse);

                    const newsData = JSON.parse(
                        $('script:contains("var newsData")')
                            .text()
                            .match(/var newsData = (.*?);/)?.[1] || '{}'
                    );

                    const images = newsData.imageList ? newsData.imageList.map((img) => `<img src="${img.image2Url}">`).join('') : '';

                    item.description = item.description ? item.description + ($('.img_caption').prop('outerHTML') ?? '') + $('.newsLeading').html() : images + $('.newsLeading').html();
                    item.pubDate ||= parseDate(newsData.publishDate, 'x');
                    item.updated ||= parseDate(newsData.lastModifyDate, 'x');
                    item.category ||= [...new Set([newsData.categoryName, ...newsData.newsTags.map((t) => t.tag), ...newsData.newsTopics.map((t) => t.topicName)])];
                }

                return item;
            })
        )
    );

    return {
        title: Object.hasOwn(categories, category) ? $('title').text() : ($('.smallSpace.active').text() || '首頁') + ' | Now 新聞',
        link: pageUrl,
        item: items,
    };
}
