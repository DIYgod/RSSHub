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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://ask.imiker.com';
    const apiUrl = new URL('explore/main/list/', rootUrl).href;
    const currentUrl = new URL(``, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            page_size: limit,
            type: 'jinghua',
            types: 'json',
        },
    });

    let items = response.slice(0, limit).map((item) => ({
        title: item.question_content,
        link: new URL(`question/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            headImage: item.headimage,
            author: item.nick_name,
            question: item.question_detail,
        }),
        author: item.nick_name,
        guid: `imiker-${item.id}`,
        pubDate: parseDate(item.add_time_timestamp * 1000),
        upvotes: item.count?.vote_count ?? 0,
        comments: item.count?.answer_count ?? 0,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('h5.img-for-lazyload').each((_, e) => {
                    const image = content(e).find('img');

                    content(e).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
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
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div#warp').html(),
                });
                item.author = content('div.name').text();

                return item;
            })
        )
    );

    const author = '米课圈';
    const description = '精华';
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author} - ${description}`,
        link: currentUrl,
        description,
        language: 'zh',
        icon,
        logo: icon,
        subtitle: description,
        author,
        allowEmpty: true,
    });
};
