import type { Data, Route } from '@/types';
import { fetchItems, hyphen2Pascal } from './utils';

export const route: Route = {
    path: '/series/:seriesName',
    parameters: { seriesName: 'topic name in the series section' },
    categories: ['programming'],
    example: '/web/series/new-to-the-web',
    radar: [
        {
            source: ['web.dev/series/:seriesName'],
            target: '/series/:seriesName',
        },
    ],
    name: 'Series',
    maintainers: ['KarasuShin'],
    handler,
    description: `::: tip
    The \`seriesName\` can be extracted from the Series page URL: \`https://web.dev/series/:seriesName\`
:::`,
};

async function handler(ctx): Promise<Data> {
    const seriesName = ctx.req.param('seriesName');

    return {
        title: seriesName,
        link: `https://web.dev/series/${seriesName}`,
        image: 'https://web.dev/_pwa/web/icons/icon-144x144.png',
        item: await fetchItems(`category:${hyphen2Pascal(seriesName)}`),
    };
}
