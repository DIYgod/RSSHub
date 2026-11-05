import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
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

const categoryNames = {
    local: '港聞',
    international: '兩岸國際',
    entertainment: '娛樂',
    life: '生活',
    technology: '科技',
    finance: '財經',
    sports: '體育',
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

对于 [事件追蹤](https://news.now.com/home/tracker) 中的 [塔利班奪權](https://news.now.com/home/tracker/detail?catCode=123\\&topicId=1056) 话题，其网址为 \`https://news.now.com/home/tracker/detail?catCode=123&topicId=1056\`，其中 \`topicId\` 为 1056，则对应路由为 [\`/now/news/tracker/1056\`](https://rsshub.app/now/news/tracker/1056)
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
    const requestedLimit = Number(ctx.req.query('limit') || '20');
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 20;
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
    const isApi = Array.isArray(response);
    const $ = load(isApi ? '' : response);

    let list: Array<DataItem & { link: string; newsId?: number }>;
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
                          image: item.newsPhotos?.find((p) => p.sizeType === '3')?.imageUrl,
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
                const $item = $(item);

                return {
                    title: $item.text(),
                    link: `${rootUrl}${$item.parent().parent().attr('href')}`,
                };
            });
    }

    const items = await pMap(
        list,
        async (item) => {
            if (item.pubDate && !item.newsId) {
                return item;
            }
            const article = await cache.tryGet(`now:article:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);

                const newsData = JSON.parse(
                    $('script:contains("var newsData")')
                        .text()
                        .match(/var newsData = (.*?);/)?.[1] || '{}'
                );

                const images = newsData.imageList ? newsData.imageList.map((img) => `<img src="${img.image2Url}">`).join('') : '';

                return {
                    description: $('.newsLeading').html() ?? '',
                    images,
                    caption: $('.img_caption').prop('outerHTML') ?? '',
                    pubDate: newsData.publishDate ? parseDate(newsData.publishDate, 'x') : undefined,
                    updated: newsData.lastModifyDate ? parseDate(newsData.lastModifyDate, 'x') : undefined,
                    category: [...new Set([newsData.categoryName, ...(newsData.newsTags ?? []).map((t) => t.tag), ...(newsData.newsTopics ?? []).map((t) => t.topicName)])].filter(Boolean),
                };
            });
            return {
                ...item,
                description: (item.description ? item.description + article.caption : article.images) + article.description,
                pubDate: item.pubDate ?? article.pubDate,
                updated: item.updated ?? article.updated,
                category: item.category ?? article.category,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: Object.hasOwn(categories, category) ? $('title').text() : ($('.smallSpace.active').text() || categoryNames[category] || '首頁') + ' | Now 新聞',
        link: pageUrl,
        item: items,
    };
}
