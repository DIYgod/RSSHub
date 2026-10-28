import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/transcripts',
    name: 'Transcripts',
    url: 'reactiflux.com/transcripts',
    maintainers: ['nczitzk'],
    handler,
    example: '/reactiflux/transcripts',
    categories: ['programming'],
    radar: [
        {
            source: ['www.reactiflux.com/transcripts'],
            target: '/transcripts',
        },
    ],
};

export async function handler(ctx) {
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.reactiflux.com';
    const currentUrl = new URL('transcripts', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const author = 'Reactiflux';
    const language: Language = 'en';
    const image = $('meta[property="og:image"]').prop('content');

    let items: Array<DataItem & { link: string }> =
        JSON.parse(response.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)?.[1] ?? '{}')
            ?.props.pageProps.all.slice(0, limit)
            .map((item: { title: string; path: string }) => {
                const title = item.title;
                const guid = `reactiflux-${item.path.replace(/\/transcripts\//, '')}`;

                return {
                    title,
                    link: new URL(item.path, rootUrl).href,
                    author,
                    guid,
                    id: guid,
                    image,
                    banner: image,
                    language,
                };
            }) ?? [];

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(`reactiflux:transcript:v3:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);

                const data = JSON.parse(detailResponse.match(/__NEXT_DATA__" type="application\/json">(.*)<\/script>/)?.[1] ?? '{}');

                const props = data.props?.pageProps;
                if (!props?.title || typeof props.html !== 'string' || !props.html || typeof data.query?.slug !== 'string' || !data.query.slug) {
                    throw new Error('Reactiflux transcript content is missing');
                }

                const title = props.title;
                const description = props.html;
                const guid = `reactiflux-${data.query.slug}`;

                item.title = title;
                item.description = description;
                item.pubDate = props.date ? parseDate(`${props.date} +0000`, 'YYYY-MM-DD ZZ') : undefined;
                item.link = new URL(`transcripts/${data.query.slug}`, rootUrl).href;
                item.author = author;
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: props.description,
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            }),
        { concurrency: 6 }
    );

    return {
        title: `${author} - ${$('title').text()}`,
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
}
