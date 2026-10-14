import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/tag/:tag?',
    categories: ['multimedia'],
    example: '/bandcamp/tag/united-kingdom',
    parameters: { tag: 'Tag, can be found in URL. All music by default.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bandcamp.com/tag/:tag', 'bandcamp.com/discover/:tag'],
            target: '/tag/:tag',
        },
        {
            source: ['bandcamp.com/discover'],
            target: '/tag',
        },
    ],
    name: 'Tag',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag') ?? '';
    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/discover${tag ? `/${encodeURIComponent(tag)}` : ''}`;
    const response = await got({
        method: 'post',
        url: `${rootUrl}/api/discover/1/discover_web`,
        json: {
            category_id: 0,
            tag_norm_names: tag ? [tag] : [],
            geoname_id: 0,
            slice: 'top',
            size: Math.min(limit, 40),
            include_result_types: ['a', 's'],
            followed_bands: false,
        },
    });

    const list: Array<{ title: string; link: string; author: string }> = response.data.results.slice(0, limit).map((item) => {
        const link = new URL(item.item_url);
        link.searchParams.delete('from');
        return { title: item.title, link: link.href, author: item.album_artist || item.band_name };
    });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                const data = JSON.parse(content('[data-tralbum]').attr('data-tralbum')!);
                const image = content('#tralbumArt img').attr('src');
                const about = content('.tralbum-about').html() ?? '';
                const tracks = data.trackinfo as Array<{ title: string; title_link?: string }>;

                return {
                    ...item,
                    image,
                    pubDate: data.current.publish_date ? parseDate(data.current.publish_date) : undefined,
                    category: content('.tralbum-tags a.tag')
                        .toArray()
                        .map((tag) => content(tag).text()),
                    description: renderToString(
                        <>
                            {image ? <img src={image} /> : null}
                            <div>{raw(about)}</div>
                            {data.current.credits ? <p style="white-space: pre-line">{data.current.credits}</p> : null}
                            <ol>
                                {tracks.map((track) => (
                                    <li>{track.title_link ? <a href={new URL(track.title_link, item.link).href}>{track.title}</a> : track.title}</li>
                                ))}
                            </ol>
                        </>
                    ),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `Bandcamp${tag ? ` - ${tag}` : ''}`,
        link: currentUrl,
        item: items,
    };
}
