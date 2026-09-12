import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/europapress',
    parameters: {
        category: 'Category, see below, Home by default',
        limit: {
            description: 'Number of articles, 10 by default',
            default: '10',
        },
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `Categories

| España   | Internacional | Economía | Deportes |
| -------- | ------------- | -------- | -------- |
| nacional | internacional | economía | deportes |

| Cultura | Sociedad | Ciencia | Salud |
| ------- | -------- | ------- | ----- |
| cultura | sociedad | ciencia | salud |

| Tecnología | Comunicados | Estar donde estés |
| ---------- | ----------- | ----------------- |
| tecnología | comunicados | estar-donde-estes |

| Andalucía | Aragón | Cantabria | Castilla-La Mancha |
| --------- | ------ | --------- | ------------------ |
| andalucia | aragon | cantabria | castilla-lamancha  |

| Castilla y León | Cataluña  | Extremadura | Galicia |
| --------------- | --------- | ----------- | ------- |
| castilla-y-leon | catalunya | extremadura | galicia |

| Islas Canarias | Islas Baleares | Madrid | País Vasco |
| -------------- | -------------- | ------ | ---------- |
| islas-canarias | illes-balears  | madrid | euskadi    |

| La Rioja | C. Valenciana        | Navarra | Asturias |
| -------- | -------------------- | ------- | -------- |
| la-rioja | comunitat-valenciana | navarra | asturias |

| Murcia | Ceuta y Melilla |
| ------ | --------------- |
| murcia | ceuta-y-melilla |`,
};

async function handler(ctx: Context) {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')!) : 10;

    const rootUrl = 'https://www.europapress.es';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await ofetch(currentUrl, { responseType: 'text' });

    const $ = load(response);

    const list = $('.articulo-titulo, .c-item__title, .home-articulo-titulo')
        .find('a')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: $item.attr('href')!,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, { responseType: 'text' });
                const content = load(detailResponse);

                return {
                    ...item,
                    description: (content('.full644').html() ?? '') + (content('.NormalTextoNoticia').html() ?? ''),
                    pubDate: parseDate(content('meta[name="date"]').attr('content')!.replace(' ', '')),
                };
            }),
        { concurrency: 2 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
