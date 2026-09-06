import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/phrack',
    name: 'Article',
    maintainers: ['CitrusIce'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.phrack.org/index_latest';
    const data = await ofetch(rootUrl);

    const $ = load(data);

    return {
        title: 'phrack',
        link: rootUrl,
        description: 'phrack magazine',
        item: [
            {
                title: $('div[id="article"]').text(),
                description: $('.md-article-area').html(),
                link: rootUrl,
            },
        ],
    };
}
