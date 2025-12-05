import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.reactiflux.com';
    const currentUrl = new URL(`transcripts`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const author = 'Reactiflux';
    const language = 'en';
    const image = $('meta[property="og:image"]').prop('content');

    let items =
        JSON.parse(response.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)?.[1] ?? '{}')
            ?.props.pageProps.all.slice(0, limit)
            .map((item) => {
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

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const data = JSON.parse(detailResponse.match(/__NEXT_DATA__" type="application\/json">(.*)<\/script>/)?.[1] ?? '{}');

                if (!data.props) {
                    return item;
                }

                const props = data.props.pageProps;

                const title = props.title;
                const description = props.html;
                const guid = `reactiflux-${data.query.slug}`;

                item.title = title;
                item.description = description;
                item.pubDate = parseDate(props.date);
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
            })
        )
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
