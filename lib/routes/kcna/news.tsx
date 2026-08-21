import { load } from 'cheerio';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { fetchPhoto, fixDesc } from './utils';

export const route: Route = {
    path: '/:lang/:category?',
    categories: ['traditional-media'],
    example: '/kcna/en',
    parameters: { lang: 'Language, refer to the table below', category: 'Category, refer to the table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.kcna.kp/:lang'],
            target: '/:lang',
        },
        {
            source: ['www.kcna.kp/:lang/article/list/:category'],
            target: '/:lang/:category',
        },
    ],
    name: 'News',
    maintainers: ['Rongronggg9'],
    handler,
    description: `| Language | 조선어 | English | 中国语 | Русский | Español | 日本語 |
| -------- | ------ | ------- | ------ | ------- | ------- | ------ |
| \`:lang\`  | \`kp\`   | \`en\`    | \`cn\`   | \`ru\`    | \`es\`    | \`jp\`   |

| Category                                                         | \`:category\`                        |
| ---------------------------------------------------------------- | ---------------------------------- |
| WPK General Secretary **Kim Jong Un**'s Revolutionary Activities | \`b0721b9f23054ddc7fe56c2811a12715\` |
| Latest News (default)                                            | \`a666dda1282180e0ee1b4427b0574ae7\` |
| Top News                                                         | \`6a47505ba5268fd7749c0fe11e4b24b4\` |
| Home News                                                        | \`2f7d854121ccbbfbe6feae9fdcc3556e\` |
| Documents                                                        | \`1afa96195f9b303902490a126ab7285f\` |
| World                                                            | \`ecc14533d88be93068af4178946b1b05\` |
| Social Life                                                      | \`680e40b40899891bbe75a7072e3285e7\` |
| External                                                         | \`e2f336db98b5e69c75e0da264e037e8d\` |
| Revolutionary Anecdote                                           | \`503e9b606704f9b1c625fa5755928cd3\` |
| Always in Memory of People                                       | \`7bc083f00425be6aadfb828fba1cb5a7\` |`,
};

async function handler(ctx: Context) {
    const { lang, category = 'a666dda1282180e0ee1b4427b0574ae7' } = ctx.req.param();

    const rootUrl = 'http://www.kcna.kp';
    const pageUrl = `${rootUrl}/${lang}/article/list/${category}`;

    const response = await ofetch(pageUrl);
    const $ = load(response);

    const title = $('head > title').text();

    const list = $('.article h5')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const dateString = $item
                .find('span')
                .text()
                .match(/\d+\.\d+\.\d+/)![0];

            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: timezone(parseDate(dateString, 'YYYY.M.D'), 9),
            };
        });

    // avoid being IP-banned
    // if being banned, 103.35.255.254 (the last hop before www.kcna.kp - 175.45.176.71) will drop the packet
    // verify that with `mtr www.kcna.kp -Tz`
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const container = $('article .container');
                const gallery = container.find('a.gallery_button').attr('href');
                container.find('h1, a.right_button').remove();

                const description = fixDesc($, container);

                // add picture
                const photo = gallery ? await fetchPhoto(new URL(gallery, rootUrl).href) : '';

                item.description = renderToString(
                    <>
                        {description ? raw(description) : null}
                        {photo ? (
                            <>
                                <br />
                                {raw(photo)}
                            </>
                        ) : null}
                    </>
                );

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title,
        link: pageUrl,
        item: items,
    };
}
