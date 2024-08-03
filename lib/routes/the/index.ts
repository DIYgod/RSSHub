import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://the.bi';
    const currentUrl = new URL(`/s/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('h3')
        .toArray()
        .filter((item) => {
            item = $(item);

            const aEl = item.parent();
            const href = aEl.prop('href');

            return href && href.startsWith('https');
        })
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.parent().prop('href'),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const image = $$('img#poster').prop('data-srcset');

                $$('figure.graf').each((_, el) => {
                    el = $$(el);

                    const imgEl = el.find('img');

                    el.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            images: imgEl
                                ? [
                                      {
                                          src: imgEl.prop('src'),
                                          width: imgEl.prop('width'),
                                          height: imgEl.prop('height'),
                                      },
                                  ]
                                : undefined,
                        })
                    );
                });

                const title = $$('h1').text();
                const intro = $$('h2').text();

                $$('h1').parent().remove();

                const description = art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                              },
                          ]
                        : undefined,
                    intro,
                    description: $$('div.section-content').html(),
                });

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('meta[property="article:published_time"]').prop('content')), +8);
                item.author = $$('meta[property="author"]').prop('content');
                item.content = {
                    html: description,
                    text: $$('div.section-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.updated = timezone(parseDate($$('meta[property="article:modified_time"]').prop('content')), +8);
                item.language = language;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '分类',
    url: 'the.bi',
    maintainers: ['nczitzk'],
    handler,
    example: '/the',
    parameters: { category: '分类，默认为空，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [时局图](https://the.bi/s/rawj7o4ypewv94)，网址为 \`https://the.bi/s/rawj7o4ypewv94\`。截取 \`https://the.bi/s/\` 到末尾的部分 \`rawj7o4ypewv94\` 作为参数填入，此时路由为 [\`/the/rawj7o4ypewv94\`](https://rsshub.app/the/rawj7o4ypewv94)。

  | 分类                                           | ID                                                      |
  | ---------------------------------------------- | ------------------------------------------------------- |
  | [时局图](https://the.bi/s/rawj7o4ypewv94)      | [rawj7o4ypewv94](https://rsshub.app/the/rawj7o4ypewv94) |
  | [剩余价值](https://the.bi/s/rawmw7dsta2jew)    | [rawmw7dsta2jew](https://rsshub.app/the/rawmw7dsta2jew) |
  | [打江山](https://the.bi/s/rawbcvxkktdkq8)      | [rawbcvxkktdkq8](https://rsshub.app/the/rawbcvxkktdkq8) |
  | [中国经济](https://the.bi/s/raw4krvx85dh27)    | [raw4krvx85dh27](https://rsshub.app/the/raw4krvx85dh27) |
  | [水深火热](https://the.bi/s/rawtn8jpsc6uvv)    | [rawtn8jpsc6uvv](https://rsshub.app/the/rawtn8jpsc6uvv) |
  | [东升西降](https://the.bi/s/rawai5kd4z15il)    | [rawai5kd4z15il](https://rsshub.app/the/rawai5kd4z15il) |
  | [大局 & 大棋](https://the.bi/s/raw2efkzejrsx8) | [raw2efkzejrsx8](https://rsshub.app/the/raw2efkzejrsx8) |
  | [境外势力](https://the.bi/s/rawmpalhnlphuc)    | [rawmpalhnlphuc](https://rsshub.app/the/rawmpalhnlphuc) |
  | [副刊](https://the.bi/s/rawxght2jr2u5z)        | [rawxght2jr2u5z](https://rsshub.app/the/rawxght2jr2u5z) |
  | [天高地厚](https://the.bi/s/rawrsnh9zakqdx)    | [rawrsnh9zakqdx](https://rsshub.app/the/rawrsnh9zakqdx) |
  | [Oyster](https://the.bi/s/rawdhl9hugdfn9)      | [rawdhl9hugdfn9](https://rsshub.app/the/rawdhl9hugdfn9) |
  :::`,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['the.bi/s/:category?'],
            target: (params) => {
                const category = params.category;

                return category ? `/${category}` : '';
            },
        },
        {
            title: '时局图',
            source: ['the.bi/s/rawj7o4ypewv94'],
            target: '/rawj7o4ypewv94',
        },
        {
            title: '剩余价值',
            source: ['the.bi/s/rawmw7dsta2jew'],
            target: '/rawmw7dsta2jew',
        },
        {
            title: '打江山',
            source: ['the.bi/s/rawbcvxkktdkq8'],
            target: '/rawbcvxkktdkq8',
        },
        {
            title: '中国经济',
            source: ['the.bi/s/raw4krvx85dh27'],
            target: '/raw4krvx85dh27',
        },
        {
            title: '水深火热',
            source: ['the.bi/s/rawtn8jpsc6uvv'],
            target: '/rawtn8jpsc6uvv',
        },
        {
            title: '东升西降',
            source: ['the.bi/s/rawai5kd4z15il'],
            target: '/rawai5kd4z15il',
        },
        {
            title: '大局 & 大棋',
            source: ['the.bi/s/raw2efkzejrsx8'],
            target: '/raw2efkzejrsx8',
        },
        {
            title: '境外势力',
            source: ['the.bi/s/rawmpalhnlphuc'],
            target: '/rawmpalhnlphuc',
        },
        {
            title: '副刊',
            source: ['the.bi/s/rawxght2jr2u5z'],
            target: '/rawxght2jr2u5z',
        },
        {
            title: '天高地厚',
            source: ['the.bi/s/rawrsnh9zakqdx'],
            target: '/rawrsnh9zakqdx',
        },
        {
            title: 'Oyster',
            source: ['the.bi/s/rawdhl9hugdfn9'],
            target: '/rawdhl9hugdfn9',
        },
    ],
};
