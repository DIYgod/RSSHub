import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';

const languages = {
    arabic: {
        rootUrl: 'https://www.aljazeera.net',
        rssUrl: 'rss',
    },
    chinese: {
        rootUrl: 'https://chinese.aljazeera.net',
        rssUrl: undefined,
    },
    english: {
        rootUrl: 'https://www.aljazeera.com',
        rssUrl: 'xml/rss/all.xml',
    },
};

const renderDescription = (image, description) =>
    renderToString(
        <>
            {image ? (
                <figure>
                    <>{raw(image)}</>
                </figure>
            ) : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );

export const route: Route = {
    path: '/:language?/:category{.+}?',
    categories: ['traditional-media'],
    example: '/aljazeera/english/news',
    parameters: {
        language: 'Language, see below, arabic by default, as Arabic',
        category: 'Category, can be found in URL, homepage by default',
    },
    description: `Language

| Arabic | Chinese | English |
| ------ | ------- | ------- |
| arabic | chinese | english |

::: tip
If you subscribe to [Al Jazeera English - Economy](https://www.aljazeera.com/economy), whose language is \`english\` and whose path is \`economy\`, you can get the route as [\`/aljazeera/english/economy\`](https://rsshub.app/aljazeera/english/economy)

If you subscribe to [Al Jazeera Chinese - Political](https://chinese.aljazeera.net/news/political) with language \`chinese\` and path \`news/political\`, you can get the route as [\`/aljazeera/chinese/news/political\`](https://rsshub.app/aljazeera/chinese/news/political)
:::`,
    radar: [
        {
            source: ['www.aljazeera.com/:category', 'www.aljazeera.com/'],
            target: '/english/:category',
        },
        {
            source: ['www.aljazeera.net/:category', 'www.aljazeera.net/'],
            target: '/arabic/:category',
        },
        {
            source: ['chinese.aljazeera.net/:category', 'chinese.aljazeera.net/'],
            target: '/chinese/:category',
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};

export async function handler(ctx) {
    const params = getSubPath(ctx).split('/').filter(Boolean);

    if (!Object.hasOwn(languages, params[0])) {
        params.unshift('arabic');
    }

    const language = params.shift();
    const isRSS = params.length === 1 && params.at(-1) === 'rss' && languages[language].rssUrl;

    const rootUrl = languages[language].rootUrl;
    const currentUrl = `${rootUrl}/${isRSS ? languages[language].rssUrl : params.join('/')}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    let items = isRSS
        ? response.data.match(new RegExp('<link>' + rootUrl + '/(.*?)</link>', 'g')).map((item) => ({
              link: item.match(/<link>(.*?)<\/link>/)[1],
          }))
        : $('.u-clickable-card__link')
              .toArray()
              .map((item) => {
                  item = $(item);

                  return {
                      link: `${rootUrl}${item.attr('href')}`,
                  };
              });

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;
    items = await Promise.all(
        items.slice(0, limit).map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                content('.more-on').parent().remove();
                content('.responsive-image img').removeAttr('srcset');
                let pubDate;

                const datePublished = detailResponse.match(/"datePublished": ?"(.*?)",/);
                if (datePublished && datePublished.length > 1) {
                    pubDate = detailResponse.match(/"datePublished": ?"(.*?)",/)[1];
                } else {
                    // uploadDate replaces datePublished for video articles
                    const uploadDate = detailResponse.match(/"uploadDate": ?"(.*?)",/)[1];

                    pubDate = uploadDate && uploadDate.length > 1 ? uploadDate : content('div.date-simple > span:nth-child(2)').text();
                }

                item.title = content('h1').first().text();
                item.author = content('.author').text();
                item.pubDate = pubDate;
                item.description = renderDescription(content('.article-featured-image').html(), content('.wysiwyg').html());

                return item;
            })
        )
    );

    return {
        title: $('title').first().text(),
        link: currentUrl,
        item: items,
    };
}
