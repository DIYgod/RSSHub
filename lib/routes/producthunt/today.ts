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
    const response = await got('https://www.producthunt.com/');

    const data = JSON.parse(load(response.data)('#__NEXT_DATA__').html());

    const list = Object.values(data.props.apolloState)
        .filter((o) => o.__typename === 'Post')
        // only includes new post, not product
        .filter((o) => Object.hasOwn(o, 'redirectToProduct') && o.redirectToProduct === null);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.slug, async () => {
                const detailresponse = await got(`https://www.producthunt.com/posts/${item.slug}`);

                const data = JSON.parse(load(detailresponse.data)('#__NEXT_DATA__').html());
                const descData = data.props.apolloState[`Post${item.id}`];

                return {
                    title: `${item.slug} - ${item.tagline}`,
                    description:
                        descData.description +
                        art(path.join(__dirname, 'templates/descImg.art'), {
                            descData,
                        }),
                    link: `https://www.producthunt.com/posts/${item.slug}`,
                    pubDate: parseDate(descData.createdAt),
                };
            })
        )
    );

    ctx.set('data', {
        title: 'Product Hunt Today Popular',
        link: 'https://www.producthunt.com/',
        item: items,
    });
};
