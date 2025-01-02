import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
const baseUrl = 'https://www.mindmeister.com';

export const route: Route = {
    path: '/:category?/:language?',
    categories: ['study'],
    example: '/mindmeister/mind-map-examples',
    parameters: { category: 'Categories, see the table below, `mind-map-examples` by default', language: 'Languages, see the table below, `en` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Public Maps',
    maintainers: ['TonyRL'],
    handler,
    description: `| Categories    | parameter         |
  | ------------- | ----------------- |
  | Featured Map  | mind-map-examples |
  | Business      | business          |
  | Design        | design            |
  | Education     | education         |
  | Entertainment | entertainment     |
  | Life          | life              |
  | Marketing     | marketing         |
  | Productivity  | productivity      |
  | Summaries     | summaries         |
  | Technology    | technology        |
  | Other         | other             |

  | Languages  | parameter |
  | ---------- | --------- |
  | English    | en        |
  | Deutsch    | de        |
  | Français   | fr        |
  | Español    | es        |
  | Português  | pt        |
  | Nederlands | nl        |
  | Dansk      | da        |
  | Русский    | ru        |
  | 日本語     | ja        |
  | Italiano   | it        |
  | 简体中文   | zh        |
  | 한국어     | ko        |
  | Other      | other     |`,
};

async function handler(ctx) {
    const { category = 'mind-map-examples', language = 'en' } = ctx.req.param();
    const link = `${baseUrl}${language === 'en' || language === 'other' ? '' : `/${language}`}/${category === 'mind-map-examples' ? category : `mind-maps/${category}?language=${language}`}`;
    const respsonse = await got(link);

    const $ = load(respsonse.data);

    const items = $('#public-listing .map-tile-wrapper')
        .toArray()
        .map((item) => {
            item = $(item);
            const imageUrl = new URL(
                item
                    .find('.map-wrapper')
                    .attr('style')
                    .match(/url\('(.*)'\);/)[1]
            ).href;

            return {
                title: item.find('.title').text(),
                description: art(path.join(__dirname, 'templates/image.art'), {
                    src: imageUrl.split('?')[0],
                    alt: item.find('.title').text().trim(),
                }),
                link: item.find('.title').attr('href'),
                author: item.find('.author').text().trim().replace(/^by/, ''),
                category: item.find('.fw-bold').text(),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name=description]').text(),
        link,
        item: items,
        language,
    };
}
