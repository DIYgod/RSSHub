import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12;

    const rootUrl = 'https://lrepacks.net';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('#main article')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h3.entry-title').text();
            const description = renderDescription({
                intro: item.find('div.entry-content').text(),
            });

            return {
                title,
                description,
                link: item.find('h3.entry-title a').prop('href'),
                category: item
                    .find('span.cat-links')
                    .toArray()
                    .map((c) => $(c).text()),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const data = JSON.parse($$('script[type="application/ld+json"]').first().text())['@graph']?.[0] ?? undefined;

                $$('div.entry-content a.highslide[href]').each((_, el) => {
                    el = $$(el);

                    el.parent().replaceWith(
                        renderDescription({
                            images: [
                                {
                                    src: el.prop('href'),
                                    alt: el.prop('title'),
                                },
                            ],
                        })
                    );
                });

                const title = $$('h2.entry-title').text();
                const description =
                    item.description +
                    renderDescription({
                        description: $$('div.entry-content').html() ?? undefined,
                    });
                const image = $$('meta[property="og:image"]').prop('content');

                item.title = title;
                item.description = description;
                item.pubDate = data ? parseDate(data.datePublished) : undefined;
                item.author = data?.author?.name ?? undefined;
                item.content = {
                    html: description,
                    text: $$('div.entry-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.updated = data ? parseDate(data.dateModified) : undefined;
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('div.logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: 'REPACK скачать',
    url: 'lrepacks.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/lrepacks',
    parameters: { category: 'Category, Homepage by default' },
    description: `::: tip
  If you subscribe to [Системные программы](https://lrepacks.net/repaki-sistemnyh-programm/)，where the URL is \`https://lrepacks.net/repaki-sistemnyh-programm/\`, extract the part \`https://lrepacks.net/\` to the end, which is \`repaki-sistemnyh-programm\`, and use it as the parameter to fill in. Therefore, the route will be [\`/lrepacks/repaki-sistemnyh-programm\`](https://rsshub.app/lrepacks/repaki-sistemnyh-programm).

| Category                                                                        | ID                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Новые репаки на сегодня](https://lrepacks.net/novye-repaki-elchupacabra/)      | [novye-repaki-elchupacabra](https://rsshub.app/lrepacks/novye-repaki-elchupacabra)           |
| [Системные программы](https://lrepacks.net/repaki-sistemnyh-programm/)          | [repaki-sistemnyh-programm](https://rsshub.app/lrepacks/repaki-sistemnyh-programm)           |
| [Программы для графики](https://lrepacks.net/repaki-programm-dlya-grafiki/)     | [repaki-programm-dlya-grafiki](https://rsshub.app/lrepacks/repaki-programm-dlya-grafiki)     |
| [Программы для интернета](https://lrepacks.net/repaki-programm-dlya-interneta/) | [repaki-programm-dlya-interneta](https://rsshub.app/lrepacks/repaki-programm-dlya-interneta) |
| [Мультимедиа программы](https://lrepacks.net/repaki-multimedia-programm/)       | [repaki-multimedia-programm](https://rsshub.app/lrepacks/repaki-multimedia-programm)         |
| [Программы для офиса](https://lrepacks.net/repaki-programm-dlya-ofisa/)         | [repaki-programm-dlya-ofisa](https://rsshub.app/lrepacks/repaki-programm-dlya-ofisa)         |
| [Разные программы](https://lrepacks.net/repaki-raznyh-programm/)                | [repaki-raznyh-programm](https://rsshub.app/lrepacks/repaki-raznyh-programm)                 |
| [Системные библиотеки](https://lrepacks.net/sistemnye-biblioteki/)              | [sistemnye-biblioteki](https://rsshub.app/lrepacks/sistemnye-biblioteki)                     |
| [Важная информация](https://lrepacks.net/informaciya/)                          | [informaciya](https://rsshub.app/lrepacks/informaciya)                                       |
:::`,
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
            source: ['lrepacks.net/:category'],
            target: (params) => {
                const category = params.category;

                return `/lrepacks${category ? `/${category}` : ''}`;
            },
        },
        {
            title: 'Новые репаки на сегодня',
            source: ['lrepacks.net/novye-repaki-elchupacabra/'],
            target: '/novye-repaki-elchupacabra',
        },
        {
            title: 'Системные программы',
            source: ['lrepacks.net/repaki-sistemnyh-programm/'],
            target: '/repaki-sistemnyh-programm',
        },
        {
            title: 'Программы для графики',
            source: ['lrepacks.net/repaki-programm-dlya-grafiki/'],
            target: '/repaki-programm-dlya-grafiki',
        },
        {
            title: 'Программы для интернета',
            source: ['lrepacks.net/repaki-programm-dlya-interneta/'],
            target: '/repaki-programm-dlya-interneta',
        },
        {
            title: 'Мультимедиа программы',
            source: ['lrepacks.net/repaki-multimedia-programm/'],
            target: '/repaki-multimedia-programm',
        },
        {
            title: 'Программы для офиса',
            source: ['lrepacks.net/repaki-programm-dlya-ofisa/'],
            target: '/repaki-programm-dlya-ofisa',
        },
        {
            title: 'Разные программы',
            source: ['lrepacks.net/repaki-raznyh-programm/'],
            target: '/repaki-raznyh-programm',
        },
        {
            title: 'Системные библиотеки',
            source: ['lrepacks.net/sistemnye-biblioteki/'],
            target: '/sistemnye-biblioteki',
        },
        {
            title: 'Важная информация',
            source: ['lrepacks.net/informaciya/'],
            target: '/informaciya',
        },
    ],
};
