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

                const next_data = JSON.parse($('script#__NEXT_DATA__').html());
                item.pubDate = parseDate(next_data.props.pageProps.article.displayDate);
                item.author = next_data.props.pageProps.article.author.name;
                item.description = next_data.props.pageProps.article.body;

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
