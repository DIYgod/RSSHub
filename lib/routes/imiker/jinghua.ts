import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/ask/jinghua',
    categories: ['new-media'],
    example: '/imiker/ask/jinghua',
    parameters: {},
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
            source: ['imiker.com/explore/find'],
        },
    ],
    name: '米课圈精华',
    maintainers: ['nczitzk'],
    handler,
    url: 'imiker.com/explore/find',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://ask.imiker.com';
    const apiUrl = new URL('explore/main/list/', rootUrl).href;
    const currentUrl = new URL('', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            page_size: limit,
            type: 'jinghua',
            types: 'json',
        },
    });

    let items: Array<DataItem & { link: string; description: string }> = response.slice(0, limit).map((item) => ({
        title: item.question_content,
        link: new URL(`question/${item.id}`, rootUrl).href,
        description: renderDescription({
            question: item.question_detail,
        }),
        author: item.nick_name,
        guid: `imiker-${item.id}`,
        pubDate: item.add_time_timestamp !== undefined && item.add_time_timestamp !== null ? parseDate(item.add_time_timestamp * 1000) : undefined,
        upvotes: item.count?.vote_count ?? 0,
        comments: item.count?.answer_count ?? 0,
    }));

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('h5.img-for-lazyload').each((_, e) => {
                    const image = content(e).find('img');

                    content(e).replaceWith(
                        renderDescription({
                            image: {
                                src: image.prop('data-original'),
                                alt: image.prop('alt'),
                                width: image.prop('data-width'),
                                height: image.prop('data-height'),
                            },
                        })
                    );
                });

                item.title = content('div.title h1').text();
                item.description += renderDescription({
                    description: content('div#warp').html() ?? undefined,
                });
                item.author = content('div.name').text();

                return item;
            }),
        { concurrency: 3 }
    );

    const author = '米课圈';
    const description = '精华';
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: `${author} - ${description}`,
        link: currentUrl,
        description,
        language: 'zh' as const satisfies Language,
        icon,
        logo: icon,
        author,
    };
}
