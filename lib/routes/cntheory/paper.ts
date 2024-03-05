// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `学习时报${id ? ` - ${id}` : ''}`,
        link: rootUrl,
        item: items,
        allowEmpty: true,
    });
};
