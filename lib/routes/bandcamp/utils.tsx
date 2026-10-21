import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const getRelease = (link: string) =>
    cache.tryGet(link, async (): Promise<DataItem> => {
        const detailResponse = await got(link);
        const content = load(detailResponse.data);
        const data = JSON.parse(content('[data-tralbum]').attr('data-tralbum')!);
        const image = content('#tralbumArt img').attr('src');
        const about = content('.tralbum-about').html() ?? '';
        const tracks = data.trackinfo as Array<{ title: string; title_link?: string }>;

        return {
            title: data.current.title,
            author: data.artist,
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
                            <li>{track.title_link ? <a href={new URL(track.title_link, link).href}>{track.title}</a> : track.title}</li>
                        ))}
                    </ol>
                </>
            ),
        };
    });
