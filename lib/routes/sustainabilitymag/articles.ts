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

const findLargestImgKey = (images) =>
    Object.keys(images)
        .filter((key) => key.startsWith('inline_free_') || key.startsWith('hero_landscape_'))
        .toSorted((a, b) => Number.parseInt(b.split('_')[2]) - Number.parseInt(a.split('_')[2]))[0];

const renderFigure = (url, caption) => `<figure><img src="${url}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`;

const render = (widgets) =>
    widgets
        .map((w) => {
            switch (w.type) {
                case 'text':
                    return w.html;
                case 'blockquote':
                    return `<blockquote>${w.html}</blockquote>`;
                case 'keyFacts':
                    return `<div><ul>${w.keyFacts.map((k) => `<li>${k.text}</li>`).join('')}</ul></div>`;
                case 'inlineVideo':
                    return w.provider === 'youtube'
                        ? `<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/${w.videoId}" frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
                        : new Error(`Unhandled inlineVideo provider: ${w.provider}`);
                case 'inlineImage':
                    return w.inlineImageImages
                        .map((image) => {
                            const i = image.images[findLargestImgKey(image.images)][0];
                            return renderFigure(i.url, i.caption);
                        })
                        .join('');
                default:
                    throw new Error(`Unhandled widget type: ${w.type}`);
            }
        })
        .join('');

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

                const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                const article = nextData.props.pageProps.article;
                item.pubDate = parseDate(article.displayDate);
                item.author = article.author.name;
                const heroImage = article.images[findLargestImgKey(article.images)][0];
                item.description = renderFigure(heroImage.url, heroImage.caption) + render(article.body.widgets);

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
