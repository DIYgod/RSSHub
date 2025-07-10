import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/paper/:id?',
    categories: ['traditional-media'],
    example: '/cntheory/paper',
    parameters: { id: '板块，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学习时报',
    maintainers: ['nczitzk'],
    handler,
    description: `如订阅 **第 A1 版：国内大局**，路由为 [\`/cntheory/paper/国内大局\`](https://rsshub.app/cntheory/paper/国内大局)。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://paper.cntheory.com';

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    response = await got({
        method: 'get',
        url: `${rootUrl}/${response.data.match(/URL=(.*)"/)[1]}`,
    });

    const $ = load(response.data);

    const matches = response.data.match(/images\/(\d{4}-\d{2}\/\d{2})\/\w+\/\w+_brief/);
    const link = `${rootUrl}/html/${matches[1]}`;

    let items = [];

    await Promise.all(
        $('#pageLink')
            .toArray()
            .filter((p) => (id ? $(p).text().split('：').pop() === id : true))
            .map((p) => `${link}/${$(p).attr('href').replace(/\.\//, '')}`)
            .map(async (p) => {
                const pageResponse = await got({
                    method: 'get',
                    url: p,
                });

                const page = load(pageResponse.data);

                items.push(
                    ...page('table')
                        .last()
                        .find('a')
                        .toArray()
                        .map((a) => `${link}/${$(a).attr('href')}`)
                );
            })
    );

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item,
                });

                const content = load(detailResponse.data);

                return {
                    link: item,
                    title: content('h1').text(),
                    pubDate: parseDate(matches[1], 'YYYY-MM/DD'),
                    enclosure_url: `${rootUrl}${
                        content('.ban_t a')
                            .first()
                            .attr('href')
                            .match(/(\/images.*)/)[1]
                    }`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        resource: content('#reslist').html().replaceAll('display:none;', ''),
                        description: content('founder-content').html(),
                    }),
                };
            })
        )
    );

    return {
        title: `学习时报${id ? ` - ${id}` : ''}`,
        link: rootUrl,
        item: items,
        allowEmpty: true,
    };
}
