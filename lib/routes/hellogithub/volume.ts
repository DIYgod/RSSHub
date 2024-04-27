import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { config } from '@/config';

art.defaults.imports.render = function (string) {
    return md.render(string);
};

export const route: Route = {
    path: ['/month', '/volume'],
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
