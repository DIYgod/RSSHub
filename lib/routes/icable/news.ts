import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { config } from '@/config';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/news/:category?',
    categories: ['traditional-media'],
    example: '/icable/news',
    parameters: { category: '分類，默認為新聞資訊' },
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
            source: ['www.i-cable.com'],
            target: '/news',
        },
        {
            source: ['www.i-cable.com/category/:category'],
            target: '/news/:category',
        },
    ],
    name: '新聞',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    url: 'www.i-cable.com/',
    description: `:::tip
    分類可用分類名稱或ID，如：新聞資訊或是38
    如需RSS內嵌影音，請在URL後加上?embed=1，否則默認以圖片代替
  :::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '新聞資訊';
    const limit = ctx.req.query('limit') ?? 20;
    const embed = ctx.req.query('embed') === '1';
    const graphqlUrl = 'https://www.i-cable.com/graphql';

    function getMainCategoryQuery() {
        return {
            query: `
      query {
        mainCategory {
          id
          name
          description
        }
      }
    `,
        };
    }

    function getCategoryEdgesQuery(mainCategoryId) {
        return {
            query: `
        query GetCategoryEdges($_id: Int) {
            categories(where: { parent: $_id, hideEmpty: true }) {
              edges {
                node {
                  id
                  databaseId
                  name
                }
              }
            }
          }
        `,
            variables: {
                _id: mainCategoryId,
            },
            operationName: 'GetCategoryEdges',
        };
    }

    function getListsByCateQuery(categoryId, limit) {
        return {
            query: `
      query getListsByCate($_category: Int) {
        posts(first: ${limit}, after: \"\", where:{categoryId: $_category}) {
          pageInfo {
            hasPreviousPage
            startCursor
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              databaseId
              title
              date
              chineseDate
              uri
              link
              featuredImage{
                node{
                  sourceUrl
                  caption
                }
              }
              mainAndSubCategory {
                main
                sub
              }
              categories {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
   `,
            variables: {
                _category: categoryId,
            },
            operationName: 'getListsByCate',
        };
    }

    const getMainCategoryResponse = await cache.tryGet(
        'icables-mainCategories',
        async () =>
            await got(graphqlUrl, {
                method: 'POST',
                body: getMainCategoryQuery(),
            }),
        config.cache.routeExpire,
        false
    );

    const mainCategories = getMainCategoryResponse.data.data.mainCategory.map((category) => ({
        name: category.name,
        id: category.id,
    }));

    const getCategoriesResponse = await Promise.all(
        mainCategories.map(
            (mainCategory) =>
                cache.tryGet(
                    `icables-categories-${mainCategory.id}`,
                    async () =>
                        await got(graphqlUrl, {
                            method: 'POST',
                            body: getCategoryEdgesQuery(mainCategory.id),
                        })
                ),
            config.cache.routeExpire,
            false
        )
    );

    const categories = getCategoriesResponse.map((response) =>
        response.data.data.categories.edges.map((category) => ({
            name: category.node.name,
            id: category.node.databaseId,
        }))
    );

    const categoriesIds = [...mainCategories, ...categories.flat()];

    const categoryInfo = categoriesIds.find((categoryA) => categoryA.name === category || categoryA.id === +category);

    const getListsByCateResponse = await got(graphqlUrl, {
        method: 'POST',
        body: getListsByCateQuery(categoryInfo.id, limit),
    });

    const list = getListsByCateResponse.data.data.posts.edges.map((value) => {
        const { id, title, link, date, categories, featuredImage } = value.node;
        const category = categories.edges.map((node) => node.node.name);
        const pubDate = timezone(parseDate(date), +8);
        const image = featuredImage ? featuredImage.node : [];
        return {
            id,
            title,
            link,
            image,
            pubDate,
            category,
        };
    });

    const feed = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(detailResponse.data);
                item.article = $('article.post-detail-wrap > p')
                    .map((i, el) => $(el).html())
                    .toArray();
                item.video = $('article.post-detail-wrap video')
                    .map((i, el) => ({
                        sourceUrl: $(el).attr('data-url'),
                        thumbnailUrl: $(el).attr('data-thumbnail') ?? item.image.sourceUrl,
                    }))
                    .toArray();
                item.category = $('.post-categories a')
                    .map((_, item) => {
                        item = $(item);
                        return item.text();
                    })
                    .toArray();
                return item;
            })
        )
    );
    const items = feed.map((item) => {
        item.description = art(path.join(__dirname, 'templates/description.art'), {
            video: embed ? item.video : [],
            image: item.image.sourceUrl,
            article: item.article,
        });
        return item;
    });

    return {
        title: `有線新聞 - ${categoryInfo.name}`,
        link: `https://www.i-cable.com/category/${categoryInfo.name}`,
        item: items,
    };
}
