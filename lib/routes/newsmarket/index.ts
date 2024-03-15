import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/newsmarket',
    parameters: { category: '分类，见下表，默认为首页' },
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
            source: ['newsmarket.com.tw/blog/category/:category', 'newsmarket.com.tw/'],
        },
    ],
    name: '分類',
    maintainers: ['nczitzk'],
    handler,
    description: `| 時事。政策  | 食安        | 新知      | 愛地方       | 種好田       | 好吃。好玩    |
  | ----------- | ----------- | --------- | ------------ | ------------ | ------------- |
  | news-policy | food-safety | knowledge | country-life | good-farming | good-food-fun |

  | 食農教育       | 人物               | 漁業。畜牧           | 綠生活。國際        | 評論    |
  | -------------- | ------------------ | -------------------- | ------------------- | ------- |
  | food-education | people-and-history | raising-and-breeding | living-green-travel | opinion |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.newsmarket.com.tw';
    const currentUrl = `${rootUrl}${category ? `/blog/category/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.title a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(),
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

                content('figure img').each(function () {
                    content(this)
                        .parent()
                        .html(`<img src="${content(this).attr('data-src')}">`);
                });

                content('.inline-post').remove();

                item.author = content('.author-name').text();
                item.description = content('.entry-content').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*)","dateModified"/)[1]);

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
