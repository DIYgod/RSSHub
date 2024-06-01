import { Route } from '@/types';
import cache from '@/utils/cache';
import oftech from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/articles',
    name: 'Articles',
    url: 'sustainabilitymag.com/articles',
    maintainers: ['mintyfrankie'],
    categories: ['other'],
    example: '/sustainabilitymag/articles',
    radar: [
        {
            source: ['https://sustainabilitymag.com/articles'],
            target: '/sustainabilitymag/articles',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

async function handler() {
    const baseURL = `https://sustainabilitymag.com`;
    const feedURL = `${baseURL}/articles`;
    const feedLang = 'en';
    const feedDescription = 'Sustainability Magazine Articles';

    const requestEndpoint = `${baseURL}/graphql`;
    const requestBody = JSON.stringify({
        query: `query PaginatedQuery($url: String!, $page: Int = 1, $widgetType: String!) {
          paginatedWidget(url: $url, widgetType: $widgetType) {
            ... on SimpleArticleGridWidget {
              articles(page: $page) {
                results {
                  _id
                  headline
                  fullUrlPath
                  featured
                  category
                  contentType
                  tags {
                    tag
                  }
                  attribution
                  subAttribution
                  sell
                  images {
                    thumbnail_widescreen_553 {
                      url
                    }
                  }
                }
              }
            }
          }
        }`,
        operationName: 'PaginatedQuery',
        variables: {
            widgetType: 'simpleArticleGrid',
            page: 1,
            url: 'https://sustainabilitymag.com/articles',
        },
    });

    const results = await oftech(requestEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
    });

    const list = results.data.paginatedWidget.articles.results.map((item) => ({
        title: item.headline,
        link: `${baseURL}${item.fullUrlPath}`,
        image: item.images?.thumbnail_widescreen_553?.url,
        category: item.category,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await oftech(item.link);
                const $ = load(response);
                item.pubDate = parseDate($('#content > div > div > div > div:nth-child(1) > div > div > div > div > div > div.ArticleHeader_Details__3n5Er > div.Breadcrumbs_Breadcrumbs__3yIKi > div:nth-child(1) > div').text());
                item.author = $('#content > div > div > div > div:nth-child(1) > div > div > div > div > div > div.ArticleHeader_Details__3n5Er > div.Type_m-body2__3AsD-.Type_d-body3__24mDH.Type_medium__2avgC > a').text();
                item.description = $('#content > div > div > div > div:nth-child(2) > div > div.GridWrapper_flex__1NgfS.GridWrapper_grow__23Wl1.GridWrapper_gutter-default__1hMKq').html();
                return item;
            })
        )
    );

    return {
        title: 'Sustainability Magazine Articles',
        language: feedLang,
        description: feedDescription,
        link: `https://${feedURL}`,
        item: items,
    };
}
