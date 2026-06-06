import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Política',
    maintainers: ['Slayer015'],
    path: '/politica',
    categories: ['new-media'],
    example: '/grupoanimal/politica',
    radar: [
        {
            source: ['www.grupoanimal.mx/politica'],
            target: '/grupoanimal/politica',
        },
    ],
    handler: async () => {
        const data = await ofetch('https://grupoanimal.mx/api/graphql', {
            method: 'POST',
            body: {
                operationName: 'GetPoliticaPaginated',
                query: /* GraphQl */ `fragment NotasGlobalesFields on NotasGlobales {
                contenido
                tituloHome
                informacionDeLaNota {
                    autor
                    extracto
                    twitterAutor {
                    usuarioTwitter
                    __typename
                    }
                    __typename
                }
                imagenVideoDestacado {
                    tipoDeContenido
                    imagenDestacada {
                    imagenS3 {
                        node {
                        sourceUrl
                        sourceUrlMedium: sourceUrl(size: MEDIUM_LARGE)
                        sourceUrlList: sourceUrl(size: MEDIUM)
                        sourceUrlListLarge: sourceUrl(size: LARGE)
                        __typename
                        }
                        __typename
                    }
                    pieImagen
                    __typename
                    }
                    videoDestacado {
                    imagenVideoS3 {
                        node {
                        sourceUrl
                        sourceUrlMedium: sourceUrl(size: MEDIUM_LARGE)
                        sourceUrlList: sourceUrl(size: MEDIUM)
                        sourceUrlListLarge: sourceUrl(size: LARGE)
                        __typename
                        }
                        __typename
                    }
                    pieVideo
                    video
                    __typename
                    }
                    __typename
                }
                __typename
                }

                query GetPoliticaPaginated($first: Int = 8, $after: String) {
                allPolTica(first: $first, after: $after) {
                    pageInfo {
                    endCursor
                    hasNextPage
                    startCursor
                    hasPreviousPage
                    __typename
                    }
                    nodes {
                    id
                    title
                    slug
                    date
                    databaseId
                    notasGlobales {
                        ...NotasGlobalesFields
                        __typename
                    }
                    tags {
                        nodes {
                        id
                        name
                        slug
                        __typename
                        }
                        __typename
                    }
                    __typename
                    }
                    __typename
                }
                }`,
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
            title: 'Grupo Animal - Política',
            link: 'https://grupoanimal.mx/politica',
            item: items,
        };
    },
};
