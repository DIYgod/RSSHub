// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

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

export default async (ctx) => {
    const params = getSubPath(ctx) === '/' ? ['arabic'] : getSubPath(ctx).replace(/^\//, '').split('/');

    if (!Object.hasOwn(languages, params[0])) {
        params.unshift('arabic');
    }

    const language = params.shift();
    const isRSS = params.length === 1 && params.at(-1) === 'rss' && languages[language].rssUrl;

    const rootUrl = languages[language].rootUrl;
    const currentUrl = `${rootUrl}/${isRSS ? languages[language].rssUrl : params.join('/')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

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
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.more-on').parent().remove();
                content('.responsive-image img').removeAttr('srcset');

                item.title = content('h1').first().text();
                item.author = content('.author').text();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished": ?"(.*?)",/)[1]);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('.article-featured-image').html(),
                    description: content('.wysiwyg').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').first().text(),
        link: currentUrl,
        item: items,
    });
};
