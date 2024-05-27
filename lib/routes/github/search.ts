import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
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
    const response = await got.get(link);
    const $ = load(response.data);

    const out = $('.repo-list li')
        .slice(0, 10)
        .map(function () {
            const a = $(this).find('.f4.text-normal > a');
            const single = {
                title: a.text(),
                author: a.text().split('/')[0].trim(),
                link: host.concat(a.attr('href')),
                description: $(this).find('div p').text().trim(),
            };
            return single;
        })
        .get();

    return {
        allowEmpty: true,
        title: `${query}的搜索结果`,
        link,
        item: out,
    };
}
