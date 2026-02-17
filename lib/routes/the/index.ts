import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';
import { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterParamsForUrl, parseFilterStr } from './util';

export const handler = async (ctx) => {
    const { filter } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 40;

    const rootUrl = 'https://the.bi/s';
    const filters = parseFilterStr(filter);
    const filtersWithPair = await bakeFiltersWithPair(filters, rootUrl);

    const searchParams = bakeFilterSearchParams(filters, 'name', false);
    const apiSearchParams = bakeFilterSearchParams(filtersWithPair, 'id', true);

    apiSearchParams.append('_embed', 'true');
    apiSearchParams.append('per_page', String(limit));
    apiSearchParams.append('page', '1');

    const apiUrl = bakeUrl(`${apiSlug}/posts`, rootUrl, apiSearchParams);
    const currentUrl = bakeUrl(getFilterParamsForUrl(filtersWithPair) ?? '', rootUrl, searchParams);

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];
        const guid = item.guid?.rendered ?? item.guid;

        const $$ = load(item.content?.rendered ?? item.content);

        const publication = $$("a[id='publication']").text(); // Must be obtained before being removed

        const image = $$('img#poster').prop('data-srcset');

        $$('figure.graf').each((_, el) => {
            el = $$(el);

            const imgEl = el.find('img');

            el.replaceWith(
                renderDescription({
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

        const description = renderDescription({
            images: image
                ? [
                      {
                          src: image,
                      },
                  ]
                : undefined,
            intro,
            description: $$.html(),
        });

        return {
            title: item.title?.rendered ?? item.title ?? title,
            description,
            pubDate: timezone(parseDate(item.date_gmt), 0),
            updated: timezone(parseDate(item.modified_gmt), 0),
            link: item.link,
            category: [...new Set(terminologies.flat().map((c) => c.name))],
            author: [...item._embedded.author, { name: publication }],
            guid,
            id: guid,
            content: {
                html: description,
                text: $$.text(),
            },
        };
    });

    const data = await fetchData(currentUrl, rootUrl);

    return {
        ...data,
        item: items,
    };
};

export const route: Route = {
    path: '/:filter{.+}?',
    name: '分类',
    url: 'the.bi',
    maintainers: ['nczitzk'],
    handler,
    example: '/the',
    parameters: { filter: '过滤器，见下方描述' },
    description: `::: tip
  如果你想订阅特定类别或标签，可以在路由中填写 filter 参数。\`/category/rawmw7dsta2jew\` 可以实现订阅 [剩余价值](https://the.bi/s/rawmw7dsta2jew) 类别。此时，路由是 [\`/the/category/rawmw7dsta2jew/\`](https://rsshub.app/the/category/rawmw7dsta2jew).

  你还可以订阅多个类别。\`/category/rawmw7dsta2jew,rawbcvxkktdkq8/\` 可以实现同时订阅 [剩余价值](https://the.bi/s/rawmw7dsta2jew) 和 [打江山](https://the.bi/s/rawbcvxkktdkq8) 两个类别。此时，路由是 [\`/the/category/rawmw7dsta2jew,rawbcvxkktdkq8\`](https://rsshub.app/the/category/rawmw7dsta2jew,rawbcvxkktdkq8).

  类别和标签也可以合并订阅。\`/category/rawmw7dsta2jew/tag/raweekl3na8trq\` 订阅 [剩余价值](https://the.bi/s/rawmw7dsta2jew) 类别和 [动物](https://the.bi/s/raweekl3na8trq) 标签。此时，路由是 [\`/the/category/rawmw7dsta2jew/tag/raweekl3na8trq\`](https://rsshub.app/the/category/rawmw7dsta2jew/tag/raweekl3na8trq).

  你还可以搜索关键字。\`/search/中国\` 搜索关键字 [中国](https://the.bi/s/?s=中国)。在这种情况下，路径是 [\`/the/search/中国\`](https://rsshub.app/the/search/中国).
:::

| 分类                                           | ID                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [时局图](https://the.bi/s/rawj7o4ypewv94)      | [rawj7o4ypewv94](https://rsshub.app/the/category/rawj7o4ypewv94) |
| [剩余价值](https://the.bi/s/rawmw7dsta2jew)    | [rawmw7dsta2jew](https://rsshub.app/the/category/rawmw7dsta2jew) |
| [打江山](https://the.bi/s/rawbcvxkktdkq8)      | [rawbcvxkktdkq8](https://rsshub.app/the/category/rawbcvxkktdkq8) |
| [中国经济](https://the.bi/s/raw4krvx85dh27)    | [raw4krvx85dh27](https://rsshub.app/the/category/raw4krvx85dh27) |
| [水深火热](https://the.bi/s/rawtn8jpsc6uvv)    | [rawtn8jpsc6uvv](https://rsshub.app/the/category/rawtn8jpsc6uvv) |
| [东升西降](https://the.bi/s/rawai5kd4z15il)    | [rawai5kd4z15il](https://rsshub.app/the/category/rawai5kd4z15il) |
| [大局 & 大棋](https://the.bi/s/raw2efkzejrsx8) | [raw2efkzejrsx8](https://rsshub.app/the/category/raw2efkzejrsx8) |
| [境外势力](https://the.bi/s/rawmpalhnlphuc)    | [rawmpalhnlphuc](https://rsshub.app/the/category/rawmpalhnlphuc) |
| [副刊](https://the.bi/s/rawxght2jr2u5z)        | [rawxght2jr2u5z](https://rsshub.app/the/category/rawxght2jr2u5z) |
| [天高地厚](https://the.bi/s/rawrsnh9zakqdx)    | [rawrsnh9zakqdx](https://rsshub.app/the/category/rawrsnh9zakqdx) |
| [Oyster](https://the.bi/s/rawdhl9hugdfn9)      | [rawdhl9hugdfn9](https://rsshub.app/the/category/rawdhl9hugdfn9) |
  `,
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

                return `/the${category ? `/category/${category}` : ''}`;
            },
        },
        {
            title: '时局图',
            source: ['the.bi/s/rawj7o4ypewv94'],
            target: '/category/rawj7o4ypewv94',
        },
        {
            title: '剩余价值',
            source: ['the.bi/s/rawmw7dsta2jew'],
            target: '/category/rawmw7dsta2jew',
        },
        {
            title: '打江山',
            source: ['the.bi/s/rawbcvxkktdkq8'],
            target: '/category/rawbcvxkktdkq8',
        },
        {
            title: '中国经济',
            source: ['the.bi/s/raw4krvx85dh27'],
            target: '/category/raw4krvx85dh27',
        },
        {
            title: '水深火热',
            source: ['the.bi/s/rawtn8jpsc6uvv'],
            target: '/category/rawtn8jpsc6uvv',
        },
        {
            title: '东升西降',
            source: ['the.bi/s/rawai5kd4z15il'],
            target: '/category/rawai5kd4z15il',
        },
        {
            title: '大局 & 大棋',
            source: ['the.bi/s/raw2efkzejrsx8'],
            target: '/category/raw2efkzejrsx8',
        },
        {
            title: '境外势力',
            source: ['the.bi/s/rawmpalhnlphuc'],
            target: '/category/rawmpalhnlphuc',
        },
        {
            title: '副刊',
            source: ['the.bi/s/rawxght2jr2u5z'],
            target: '/category/rawxght2jr2u5z',
        },
        {
            title: '天高地厚',
            source: ['the.bi/s/rawrsnh9zakqdx'],
            target: '/category/rawrsnh9zakqdx',
        },
        {
            title: 'Oyster',
            source: ['the.bi/s/rawdhl9hugdfn9'],
            target: '/category/rawdhl9hugdfn9',
        },
    ],
};
