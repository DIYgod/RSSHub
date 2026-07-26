import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';
import sanitizeHtml from 'sanitize-html';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { fetchPhoto, fetchVideo, fixDesc } from './utils';

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
            source: ['www.kcna.kp/:lang', 'www.kcna.kp/:lang/category/articles/q/1ee9bdb7186944f765208f34ecfb5407.kcmsf', 'www.kcna.kp/:lang/category/articles.kcmsf'],
            target: '/:lang',
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
| Society-Life                                                     | \`680e40b40899891bbe75a7072e3285e7\` |
| External                                                         | \`e2f336db98b5e69c75e0da264e037e8d\` |
| News Commentary                                                  | \`12c03a49f7dbe829bceea8ac77088c21\` |`,
};

async function handler(ctx) {
    const { lang, category = 'a666dda1282180e0ee1b4427b0574ae7' } = ctx.req.param();

    const rootUrl = 'http://www.kcna.kp';
    const pageUrl = `${rootUrl}/${lang}/article/list/${category}`;

    const response = await got(pageUrl);
    const $ = load(response.data);

    // fix <nobr><span class="fSpecCs">???</span></nobr>
    const title = sanitizeHtml($('head > title').text(), { allowedTags: [], allowedAttributes: {} });

    const list = $('.article a')
        .toArray()
        .map((item) => {
            item = $(item);
            const dateElem = item.next();
            const dateString = dateElem.text().match(/\d+\.\d+\.\d+/);
            dateElem.remove();
            return {
                title: item.text(),
                link: rootUrl + item.attr('href'),
                pubDate: timezone(parseDate(dateString[0]), 9),
            };
        });

    // avoid being IP-banned
    // if being banned, 103.35.255.254 (the last hop before www.kcna.kp - 175.45.176.71) will drop the packet
    // verify that with `mtr www.kcna.kp -Tz`
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const description = $('.container p').toArray().map((e) => $(e).html()).join("<br />");

                // add picture and video
                let photo, video;
                if ($('.gallery_button').length !== 0) {
                    const mediaURL = new URL($('.gallery_button').attr("href"), rootUrl).href;
                    const mediaResponse = await got(mediaURL)
                    const $media = load(mediaResponse.data);
                    const media = $media(".item img")
                        .toArray()
                        .map((elem) => new URL($media(elem).attr('src'), rootUrl).href);
                    photo = media.map((e) => e.includes("/photo/") ? `<img src="${e}">` : null).filter(Boolean).join("<br />");
                }

                item.description = renderToString(
                    <>
                        {description ? raw(description) : null}
                        {photo ? (
                            <>
                                <br />
                                {raw(photo)}
                            </>
                        ) : null}
                        {video ? (
                            <>
                                <br />
                                {raw(video)}
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
