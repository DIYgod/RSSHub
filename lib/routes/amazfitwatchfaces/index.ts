import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { device, sort, searchParams } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://amazfitwatchfaces.com';
    const targetUrl: string = new URL(`${device}/${sort}${searchParams ? `?${searchParams}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.wf-panel')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.prop('title');
            const image: string | undefined = $el.find('img.wf-img').attr('src');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });
            const linkUrl: string | undefined = $el.find('a.wf-act').attr('href');
            const categoryEls: Element[] = $el.find('div.wf-comp code').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authorEls: Element[] = $el.find('div.wf-user a').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href') ? new URL($authorEl.attr('href') as string, baseUrl).href : undefined,
                    avatar: undefined,
                };
            });

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.page-title h1').text();
                    const image: string | undefined = $$('img#watchface-preview').attr('src');
                    const description: string | undefined = renderDescription({
                        images: image
                            ? [
                                  {
                                      src: image,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                        description: $$('div.unicodebidi').html() ?? undefined,
                    });
                    const pubDateStr: string | undefined = $$('i.fa-calendar').parent().find('span').text();
                    const linkUrl: string | undefined = $$('.title').attr('href');
                    const categoryEls: Element[] = $$('div.mdesc a.btn-sm').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                    const authorEls: Element[] = $$('div.wf-userinfo-name').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl).find('a.wf-author-h');

                        return {
                            name: $$authorEl.text(),
                            url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                            avatar: $$authorEl.find('img.wf-userpic').attr('src'),
                        };
                    });
                    const upDatedStr: string | undefined = $$('i.fa-clock-o').parent().find('span').text();

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr, 'DD.MM.YYYY HH:mm') : item.pubDate,
                        link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        image,
                        banner: image,
                        updated: upDatedStr ? parseDate(upDatedStr, 'DD.MM.YYYY HH:mm') : item.updated,
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.mainlogolg').attr('src') ? new URL($('img.mainlogolg').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:device/:sort/:searchParams?',
    name: 'Watch Faces',
    url: 'amazfitwatchfaces.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/amazfitwatchfaces/amazfit-x/fresh',
    parameters: {
        device: {
            description: 'Device Id',
            options: [
                {
                    label: 'Amazfit X',
                    value: 'amazfit-x',
                },
                {
                    label: 'Amazfit Band',
                    value: 'amazfit-band',
                },
                {
                    label: 'Amazfit Bip',
                    value: 'bip',
                },
                {
                    label: 'Amazfit Active',
                    value: 'active',
                },
                {
                    label: 'Amazfit Balance',
                    value: 'balance',
                },
                {
                    label: 'Amazfit Cheetah',
                    value: 'cheetah',
                },
                {
                    label: 'Amazfit Falcon',
                    value: 'falcon',
                },
                {
                    label: 'Amazfit GTR',
                    value: 'gtr',
                },
                {
                    label: 'Amazfit GTS',
                    value: 'gts',
                },
                {
                    label: 'Amazfit T-Rex',
                    value: 't-rex',
                },
                {
                    label: 'Amazfit Stratos',
                    value: 'pace',
                },
                {
                    label: 'Amazfit Verge Lite',
                    value: 'verge-lite',
                },
                {
                    label: 'Haylou Watches',
                    value: 'haylou',
                },
                {
                    label: 'Huawei Watches',
                    value: 'huawei-watch-gt',
                },
                {
                    label: 'Xiaomi Mi Band 4',
                    value: 'mi-band-4',
                },
                {
                    label: 'Xiaomi Mi Band 5',
                    value: 'mi-band-5',
                },
                {
                    label: 'Xiaomi Mi Band 6',
                    value: 'mi-band-6',
                },
                {
                    label: 'Xiaomi Mi Band 7',
                    value: 'mi-band-7',
                },
                {
                    label: 'Xiaomi Smart Band 8',
                    value: 'mi-band',
                },
                {
                    label: 'Xiaomi Smart Band 9',
                    value: 'mi-band',
                },
            ],
        },
        sort: {
            description: 'Sort By',
            options: [
                {
                    label: 'Fresh',
                    value: 'fresh',
                },
                {
                    label: 'Updated',
                    value: 'updated',
                },
                {
                    label: 'Random',
                    value: 'random',
                },
                {
                    label: 'Top',
                    value: 'top',
                },
            ],
        },
        searchParams: {
            description: 'Search Params',
        },
    },
    description: `::: tip
If you subscribe to [Updated watch faces for Amazfit X](https://amazfitwatchfaces.com/amazfit-x/updated)，where the URL is \`https://amazfitwatchfaces.com/amazfit-x/updated\`, extract the part \`https://amazfitwatchfaces.com/\` to the end, which is \`amazfit-x/updated\`, and use it as the parameter to fill in. Therefore, the route will be [\`/amazfitwatchfaces/amazfit-x/updated\`](https://rsshub.app/amazfitwatchfaces/amazfit-x/updated).

If you subscribe to [TOP for the last 6 months (Only new) - Xiaomi Smart Band 9](https://amazfitwatchfaces.com/mi-band/top?compatible=Smart_Band_9&topof=6months)，where the URL is \`https://amazfitwatchfaces.com/mi-band/top?compatible=Smart_Band_9&topof=6months\`, extract the part \`https://amazfitwatchfaces.com/\` to the end, which is \`mi-band/top\`, and use it as the parameter to fill in. Therefore, the route will be [\`/amazfitwatchfaces/mi-band/top/compatible=Smart_Band_9&topof=6months\`](https://rsshub.app/amazfitwatchfaces/mi-band/top/compatible=Smart_Band_9&topof=6months).
:::

<details>
  <summary>More devices</summary>

| Device Name                                                                                | Device Id       |
| ------------------------------------------------------------------------------------------ | --------------- |
| [Amazfit X](https://amazfitwatchfaces.com/amazfit-x/fresh)                                 | [amazfit-x](https://rsshub.app/amazfitwatchfaces/amazfit-x/fresh) |
| [Amazfit Band](https://amazfitwatchfaces.com/amazfit-band/fresh)                           | [amazfit-band](https://rsshub.app/amazfitwatchfaces/amazfit-band/fresh) |
| [Amazfit Bip](https://amazfitwatchfaces.com/bip/fresh)                                     | [bip](https://rsshub.app/amazfitwatchfaces/bip/fresh) |
| [Amazfit Active](https://amazfitwatchfaces.com/active/fresh)                               | [active](https://rsshub.app/amazfitwatchfaces/active/fresh) |
| [Amazfit Balance](https://amazfitwatchfaces.com/balance/fresh)                             | [balance](https://rsshub.app/amazfitwatchfaces/balance/fresh) |
| [Amazfit Cheetah](https://amazfitwatchfaces.com/cheetah/fresh)                             | [cheetah](https://rsshub.app/amazfitwatchfaces/cheetah/fresh) |
| [Amazfit Falcon](https://amazfitwatchfaces.com/falcon/fresh)                               | [falcon](https://rsshub.app/amazfitwatchfaces/falcon/fresh) |
| [Amazfit GTR](https://amazfitwatchfaces.com/gtr/fresh)                                     | [gtr](https://rsshub.app/amazfitwatchfaces/gtr/fresh) |
| [Amazfit GTS](https://amazfitwatchfaces.com/gts/fresh)                                     | [gts](https://rsshub.app/amazfitwatchfaces/gts/fresh) |
| [Amazfit T-Rex](https://amazfitwatchfaces.com/t-rex/fresh)                                 | [t-rex](https://rsshub.app/amazfitwatchfaces/t-rex/fresh) |
| [Amazfit Stratos](https://amazfitwatchfaces.com/pace/fresh)                                | [pace](https://rsshub.app/amazfitwatchfaces/pace/fresh) |
| [Amazfit Verge Lite](https://amazfitwatchfaces.com/verge-lite/fresh)                       | [verge-lite](https://rsshub.app/amazfitwatchfaces/verge-lite/fresh) |
| [Haylou Watches](https://amazfitwatchfaces.com/haylou/fresh)                               | [haylou](https://rsshub.app/amazfitwatchfaces/haylou/fresh) |
| [Huawei Watches](https://amazfitwatchfaces.com/huawei-watch-gt/fresh)                      | [huawei-watch-gt](https://rsshub.app/amazfitwatchfaces/huawei-watch-gt/fresh) |
| [Xiaomi Mi Band 4](https://amazfitwatchfaces.com/mi-band-4/fresh)                          | [mi-band-4](https://rsshub.app/amazfitwatchfaces/mi-band-4/fresh) |
| [Xiaomi Mi Band 5](https://amazfitwatchfaces.com/mi-band-5/fresh)                          | [mi-band-5](https://rsshub.app/amazfitwatchfaces/mi-band-5/fresh) |
| [Xiaomi Mi Band 6](https://amazfitwatchfaces.com/mi-band-6/fresh)                          | [mi-band-6](https://rsshub.app/amazfitwatchfaces/mi-band-6/fresh) |
| [Xiaomi Mi Band 7](https://amazfitwatchfaces.com/mi-band-7/fresh)                          | [mi-band-7](https://rsshub.app/amazfitwatchfaces/mi-band-7/fresh) |
| [Xiaomi Smart Band 8](https://amazfitwatchfaces.com/mi-band/fresh?compatible=Smart_Band_8) | [mi-band](https://rsshub.app/amazfitwatchfaces/mi-band/fresh/compatible=Smart_Band_8) |
| [Xiaomi Smart Band 9](https://amazfitwatchfaces.com/mi-band/fresh?compatible=Smart_Band_9) | [mi-band](https://rsshub.app/amazfitwatchfaces/mi-band/fresh/compatible=Smart_Band_9) |

</details>
`,
    categories: ['program-update'],
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
            source: ['amazfitwatchfaces.com/:device/:sort'],
            target: (params) => {
                const device: string = params.device;
                const sort: string = params.sort;

                return `/amazfitwatchfaces${device ? `/${device}${sort ? `/${sort}` : ''}` : ''}`;
            },
        },
        {
            title: 'Fresh watch faces for Amazfit X',
            source: ['amazfitwatchfaces.com/amazfit-x/fresh'],
            target: '/amazfit-x/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Band',
            source: ['amazfitwatchfaces.com/amazfit-band/fresh'],
            target: '/amazfit-band/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Bip',
            source: ['amazfitwatchfaces.com/bip/fresh'],
            target: '/bip/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Active',
            source: ['amazfitwatchfaces.com/active/fresh'],
            target: '/active/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Balance',
            source: ['amazfitwatchfaces.com/balance/fresh'],
            target: '/balance/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Cheetah',
            source: ['amazfitwatchfaces.com/cheetah/fresh'],
            target: '/cheetah/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Falcon',
            source: ['amazfitwatchfaces.com/falcon/fresh'],
            target: '/falcon/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit GTR',
            source: ['amazfitwatchfaces.com/gtr/fresh'],
            target: '/gtr/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit GTS',
            source: ['amazfitwatchfaces.com/gts/fresh'],
            target: '/gts/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit T-Rex',
            source: ['amazfitwatchfaces.com/t-rex/fresh'],
            target: '/t-rex/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Stratos',
            source: ['amazfitwatchfaces.com/pace/fresh'],
            target: '/pace/fresh',
        },
        {
            title: 'Fresh watch faces for Amazfit Verge Lite',
            source: ['amazfitwatchfaces.com/verge-lite/fresh'],
            target: '/verge-lite/fresh',
        },
        {
            title: 'Fresh watch faces for Haylou Watches',
            source: ['amazfitwatchfaces.com/haylou/fresh'],
            target: '/haylou/fresh',
        },
        {
            title: 'Fresh watch faces for Huawei Watches',
            source: ['amazfitwatchfaces.com/huawei-watch-gt/fresh'],
            target: '/huawei-watch-gt/fresh',
        },
        {
            title: 'Fresh watch faces for Xiaomi Mi Band 4',
            source: ['amazfitwatchfaces.com/mi-band-4/fresh'],
            target: '/mi-band-4/fresh',
        },
        {
            title: 'Fresh watch faces for Xiaomi Mi Band 5',
            source: ['amazfitwatchfaces.com/mi-band-5/fresh'],
            target: '/mi-band-5/fresh',
        },
        {
            title: 'Fresh watch faces for Xiaomi Mi Band 6',
            source: ['amazfitwatchfaces.com/mi-band-6/fresh'],
            target: '/mi-band-6/fresh',
        },
        {
            title: 'Fresh watch faces for Xiaomi Mi Band 7',
            source: ['amazfitwatchfaces.com/mi-band-7/fresh'],
            target: '/mi-band-7/fresh',
        },
        {
            title: 'Fresh watch faces for Xiaomi Smart Band 8',
            source: ['amazfitwatchfaces.com/mi-band/fresh'],
            target: '/mi-band/fresh/compatible=Smart_Band_8',
        },
        {
            title: 'Fresh watch faces for Xiaomi Smart Band 9',
            source: ['amazfitwatchfaces.com/mi-band/fresh'],
            target: '/mi-band/fresh/compatible=Smart_Band_9',
        },
    ],
    view: ViewType.Articles,
};
