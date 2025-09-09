import type { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://www.uol.com.br/esporte/';
const apiUrl = 'https://jcon.uol.com.br/front-jcon/v1/widget/contents/esporte?local=esporte&sub-local=home-esporte';

export const route: Route = {
    path: '/esporte',
    categories: ['traditional-media'],
    example: '/uol/esporte',
    name: 'Esporte',
    maintainers: ['gemini-code-assist'],
    handler,
    url: 'uol.com.br/esporte',
    description: 'Manchetes da seção de Esportes do UOL.',
};

async function handler(): Promise<Data> {
    const response = await ofetch(apiUrl);

    const items = response.data[0].widgets.flatMap((widget: any) =>
        widget.data.contents
            .filter((content: any) => content.headline)
            .map((content: any) => ({
                title: content.headline,
                link: content.url,
                description: content.summary,
                pubDate: new Date(content.publishedAt * 1000),
                author: content.authors?.[0]?.name,
            }))
    );

    return {
        title: 'UOL - Esporte',
        link: rootUrl,
        item: items,
        description: 'Manchetes da seção de Esportes do UOL.',
        language: 'pt-br',
    };
}
