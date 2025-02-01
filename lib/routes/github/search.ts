import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import * as url from 'node:url';

const host = 'https://github.com';

export const route: Route = {
    path: '/search/:query/:sort?/:order?',
    categories: ['programming'],
    example: '/github/search/RSSHub/bestmatch/desc',
    parameters: { query: 'search keyword', sort: 'Sort options (default to bestmatch)', order: 'Sort order, desc and asc (desc descending by default)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search Result',
    maintainers: ['LogicJake'],
    handler,
    description: `| Sort options     | sort      |
| ---------------- | --------- |
| Best match       | bestmatch |
| Most stars       | stars     |
| Most forks       | forks     |
| Recently updated | updated   |`,
};

async function handler(ctx) {
    const query = ctx.req.param('query');
    let sort = ctx.req.param('sort') || 'bestmatch';
    const order = ctx.req.param('order') || 'desc';

    if (sort === 'bestmatch') {
        sort = '';
    }

    const suffix = 'search?o='.concat(order, '&q=', encodeURIComponent(query), '&s=', sort, '&type=Repositories');
    const link = url.resolve(host, suffix);
    const response = await ofetch(link, {
        headers: {
            accept: 'application/json',
        },
    });

    const out = response.payload.results.map((item) => {
        const {
            repo: { repository },
            hl_trunc_description,
        } = item;

        return {
            title: repository.name,
            author: repository.owner_login,
            link: host.concat(`/${repository.owner_login}/${repository.name}`),
            description: hl_trunc_description,
        } as DataItem;
    });

    return {
        allowEmpty: true,
        title: `${query}的搜索结果`,
        link,
        item: out,
    };
}
