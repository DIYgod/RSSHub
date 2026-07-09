import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { categoryLabel, enrichItems, fetchNewsList, MENU_CATEGORIES, resolveCategoryId, siteUrl, slugify } from './utils';

const categoryOptions = Object.entries(MENU_CATEGORIES).map(([value, label]) => ({
    value,
    label: `${label} (${value})`,
}));

export const route: Route = {
    path: ['/noticias/:category?', '/:category?'],
    categories: ['traditional-media'],
    example: '/jornaldeangola/noticias/politica',
    parameters: {
        category: {
            description: 'Category id or slug (see table). Omit for latest news. Special values: `destaque` (featured), `ultima-hora` (breaking). Full article HTML is included by default; append `?fulltext=0` for list-only.',
            options: [{ value: 'destaque', label: 'Destaque (featured)' }, { value: 'ultima-hora', label: 'Última hora (breaking)' }, ...categoryOptions],
        },
    },
    radar: [
        {
            source: ['www.jornaldeangola.ao/noticias/:idCategoria/:categoria', 'www.jornaldeangola.ao/noticias/:idCategoria/:categoria/:idNoticia/:titulo', 'www.jornaldeangola.ao/noticias', 'www.jornaldeangola.ao/'],
            target: (params) => {
                if (params.idCategoria) {
                    return `/noticias/${params.idCategoria}`;
                }
                return '/noticias';
            },
        },
    ],
    name: 'Notícias',
    maintainers: ['lisyer'],
    url: 'www.jornaldeangola.ao/noticias',
    description: `## Categories

| Política     | Regiões     | Sociedade     | Economia     | Cultura     | Desporto     |
| ------------ | ----------- | ------------- | ------------ | ----------- | ------------ |
| 1 / politica | 2 / regiões | 3 / sociedade | 4 / economia | 5 / cultura | 6 / desporto |

| Entrevista     | Reportagem     | Opinião     | Mundo      | Gente      | Notícias      |
| -------------- | -------------- | ----------- | ---------- | ---------- | ------------- |
| 7 / entrevista | 8 / reportagem | 9 / opinião | 10 / mundo | 11 / gente | 41 / noticias |

Special filters (not category ids):

| Destaque | Última hora | Latest (all) |
| -------- | ----------- | ------------ |
| destaque | ultima-hora | *(empty)*    |

Examples:

- Latest: [\`/jornaldeangola/noticias\`](https://rsshub.app/jornaldeangola/noticias)
- Politics: [\`/jornaldeangola/noticias/1\`](https://rsshub.app/jornaldeangola/noticias/1) or [\`/jornaldeangola/noticias/politica\`](https://rsshub.app/jornaldeangola/noticias/politica)
- Sport: [\`/jornaldeangola/noticias/desporto\`](https://rsshub.app/jornaldeangola/noticias/desporto)
- Featured: [\`/jornaldeangola/noticias/destaque\`](https://rsshub.app/jornaldeangola/noticias/destaque)
- Breaking: [\`/jornaldeangola/noticias/ultima-hora\`](https://rsshub.app/jornaldeangola/noticias/ultima-hora)

Supports \`limit\` query (default 20) and \`fulltext=0\` to skip article body fetch.`,
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

async function handler(ctx) {
    const raw = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const fulltext = ctx.req.query('fulltext') !== '0';

    let categoryId: number | undefined;
    let destaque = false;
    let ultimaHora = false;
    let label = 'Últimas';
    let link = `${siteUrl}/noticias`;

    if (raw) {
        const key = slugify(decodeURIComponent(raw));
        if (['destaque', 'destaques'].includes(key)) {
            destaque = true;
            label = 'Destaque';
        } else if (['ultima-hora', 'ultimahora', 'ultima_hora'].includes(key)) {
            ultimaHora = true;
            label = 'Última hora';
        } else {
            categoryId = resolveCategoryId(raw);
            if (categoryId === undefined) {
                throw new InvalidParameterError(`Unknown category: ${raw}. Use a category id (e.g. 1) or slug (e.g. politica), or destaque / ultima-hora.`);
            }
            label = categoryLabel(categoryId);
            link = `${siteUrl}/noticias/${categoryId}/${encodeURIComponent(slugify(label))}`;
        }
    }

    const list = await fetchNewsList({ categoryId, limit, destaque, ultimaHora });
    const items = await enrichItems(list, fulltext);

    return {
        title: `Jornal de Angola - ${label}`,
        link,
        description: `Notícias de ${label} — Jornal de Angola`,
        language: 'pt-ao',
        image: `${siteUrl}/favicon.ico`,
        item: items,
    };
}
