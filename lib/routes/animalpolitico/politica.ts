import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Política',
    maintainers: ['Slayer015'],
    path: '/politica',
    categories: ['traditional-media'],
    example: '/animalpolitico/politica',
    radar: [
        {
            source: ['www.grupoanimal.mx/politica'],
            target: '/animalpolitico/politica',
        },
    ],
    handler: async () => {
        const data = await ofetch('https://grupoanimal.mx/api/graphql', {
            method: 'POST',
            body: {
                operationName: 'GetPoliticaPaginated',
                query: 'fragment NotasGlobalesFields on NotasGlobales {\n  contenido\n  tituloHome\n  informacionDeLaNota {\n    autor\n    extracto\n    twitterAutor {\n      usuarioTwitter\n      __typename\n    }\n    __typename\n  }\n  imagenVideoDestacado {\n    tipoDeContenido\n    imagenDestacada {\n      imagenS3 {\n        node {\n          sourceUrl\n          sourceUrlMedium: sourceUrl(size: MEDIUM_LARGE)\n          sourceUrlList: sourceUrl(size: MEDIUM)\n          sourceUrlListLarge: sourceUrl(size: LARGE)\n          __typename\n        }\n        __typename\n      }\n      pieImagen\n      __typename\n    }\n    videoDestacado {\n      imagenVideoS3 {\n        node {\n          sourceUrl\n          sourceUrlMedium: sourceUrl(size: MEDIUM_LARGE)\n          sourceUrlList: sourceUrl(size: MEDIUM)\n          sourceUrlListLarge: sourceUrl(size: LARGE)\n          __typename\n        }\n        __typename\n      }\n      pieVideo\n      video\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nquery GetPoliticaPaginated($first: Int = 8, $after: String) {\n  allPolTica(first: $first, after: $after) {\n    pageInfo {\n      endCursor\n      hasNextPage\n      startCursor\n      hasPreviousPage\n      __typename\n    }\n    nodes {\n      id\n      title\n      slug\n      date\n      databaseId\n      notasGlobales {\n        ...NotasGlobalesFields\n        __typename\n      }\n      tags {\n        nodes {\n          id\n          name\n          slug\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}',
                variables: {
                    first: 25,
                },
            },
        });

        const items = data.data.allPolTica.nodes.map((item) => ({
            title: item.title,
            link: `https://grupoanimal.mx/politica/${item.slug}`,
            author: item.notasGlobales.informacionDeLaNota.autor,
            pubDate: parseDate(item.date),
            category: item.tags.nodes.map((label) => label.name),
            description: item.notasGlobales.contenido,
        }));

        return {
            title: 'Animal Político - Política',
            link: 'https://grupoanimal.mx/politica',
            item: items,
        };
    },
};
