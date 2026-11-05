import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt({
    html: true,
});

const renderVolume = (data) =>
    renderToString(
        <>
            {data?.map((category) => (
                <div>
                    <h1>{category.category_name}</h1>
                    {category.items?.map((item) => (
                        <div>
                            <h2>
                                <a href={item.github_url}>{item.name}</a>
                            </h2>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Stars</th>
                                        <td>{item.stars}</td>
                                    </tr>
                                    <tr>
                                        <th>Forks</th>
                                        <td>{item.forks}</td>
                                    </tr>
                                    <tr>
                                        <th>Watch</th>
                                        <td>{item.watch}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p>{item.description ? raw(md.render(item.description)) : null}</p>
                            {item.image_url ? (
                                <figure>
                                    <img src={item.image_url} />
                                </figure>
                            ) : null}
                        </div>
                    ))}
                </div>
            ))}
        </>
    );

export const route: Route = {
    path: '/volume',
    example: '/hellogithub/volume',
    name: '月刊',
    maintainers: ['moke8', 'nczitzk', 'CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 10);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(10, limit);
    const rootUrl = 'https://hellogithub.com';
    const apiUrl = 'https://api.hellogithub.com/v1/periodical/';

    const periodicalResponse = await got({
        method: 'get',
        url: apiUrl,
    });
    const volumes: Array<{ num: number; lastmod: string }> = periodicalResponse.data.volumes.slice(0, candidateLimit);

    const items = await pMap(
        volumes,
        async (volume) => {
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
                        description: renderVolume(data.pageProps.volume.data),
                        pubDate: data.pageProps.volume.publish_at ? parseDateInTimezone(data.pageProps.volume.publish_at, 8) : undefined,
                    };
                },
                config.cache.routeExpire,
                false
            );
        },
        { concurrency: 3 }
    );

    return {
        title: 'HelloGithub - 月刊',
        link: 'https://hellogithub.com/periodical',
        item: items,
    };
}
