import path from 'node:path';

import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const md = MarkdownIt({
    html: true,
});

art.defaults.imports.render = function (string) {
    return md.render(string);
};

export const route: Route = {
    path: '/volume',
    example: '/hellogithub/volume',
    name: '月刊',
    maintainers: ['moke8', 'nczitzk', 'CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const limit: number = Number.parseInt(ctx.req.query('limit')) || 10;
    const rootUrl = 'https://hellogithub.com';
    const apiUrl = 'https://api.hellogithub.com/v1/periodical/';

    const periodicalResponse = await got({
        method: 'get',
        url: apiUrl,
    });
    const volumes = periodicalResponse.data.volumes.slice(0, limit);

    const items = await Promise.all(
        volumes.map(async (volume) => {
            const current = volume.num;
            const lastmod = volume.lastmod;
            const currentUrl = `${rootUrl}/periodical/volume/${current}`;
            const key = `hellogithub:${currentUrl}`;
            return await cache.tryGet(
                key,
                async () => {
                    const buildResponse = await got({
                        method: 'get',
                        url: currentUrl,
                    });

                    const $ = load(buildResponse.data);

                    const text = $('#__NEXT_DATA__').text();
                    const response = JSON.parse(text);
                    const data = response.props;
                    const id = data.pageProps.volume.current_num;
                    return {
                        title: `《HelloGitHub》第 ${id} 期`,
                        link: `${rootUrl}/periodical/volume/${id}`,
                        description: art(path.join(__dirname, 'templates/volume.art'), {
                            data: data.pageProps.volume.data,
                        }),
                        pubDate: parseDate(lastmod),
                    };
                },
                config.cache.routeExpire,
                false
            );
        })
    );

    return {
        title: 'HelloGithub - 月刊',
        link: 'https://hellogithub.com/periodical',
        item: items,
    };
}
