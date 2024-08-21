import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
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

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const params = getSubPath(ctx) === '/' ? ['arabic'] : getSubPath(ctx).replace(/^\//, '').split('/');

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

    items = await Promise.all(
        items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50).map((item) =>
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
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('.article-featured-image').html(),
                    description: content('.wysiwyg').html(),
                });

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
