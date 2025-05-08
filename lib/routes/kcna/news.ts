import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import pMap from 'p-map';
import { art } from '@/utils/render';
import { fixDesc, fetchPhoto, fetchVideo } from './utils';
import path from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
| WPK General Secretary **Kim Jong Un**'s Revolutionary Activities | \`54c0ca4ca013a92cc9cf95bd4004c61a\` |
| Latest News (default)                                            | \`1ee9bdb7186944f765208f34ecfb5407\` |
| Top News                                                         | \`5394b80bdae203fadef02522cfb578c0\` |
| Home News                                                        | \`b2b3bcc1b0a4406ab0c36e45d5db58db\` |
| Documents                                                        | \`a8754921399857ebdbb97a98a1e741f5\` |
| World                                                            | \`593143484cf15d48ce85c26139582395\` |
| Society-Life                                                     | \`93102e5a735d03979bc58a3a7aefb75a\` |
| External                                                         | \`0f98b4623a3ef82aeea78df45c423fd0\` |
| News Commentary                                                  | \`12c03a49f7dbe829bceea8ac77088c21\` |`,
};

async function handler(ctx) {
    const { lang, category = '1ee9bdb7186944f765208f34ecfb5407' } = ctx.req.param();

    const rootUrl = 'http://www.kcna.kp';
    const pageUrl = `${rootUrl}/${lang}/category/articles/q/${category}.kcmsf`;

    const response = await got(pageUrl);
    const $ = load(response.data);

    // fix <nobr><span class="fSpecCs">???</span></nobr>
    const title = sanitizeHtml($('head > title').text(), { allowedTags: [], allowedAttributes: {} });

    const list = $('.article-link li a')
        .toArray()
        .map((item) => {
            item = $(item);
            const dateElem = item.find('.publish-time');
            const dateString = dateElem.text().match(/\d+\.\d+\.\d+/);
            dateElem.remove();
            return {
                title: item.text(),
                link: rootUrl + item.attr('href'),
                pubDate: timezone(parseDate(dateString[0]), +9),
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
                item.title = $('article-main-title').text() || item.title;

                const dateElem = $('.publish-time');
                const dateString = dateElem.text().match(/\d+\.\d+\.\d+/);
                dateElem.remove();
                item.pubDate = dateString ? timezone(parseDate(dateString[0]), +9) : item.pubDate;

                const description = fixDesc($, $('.article-content-body .content-wrapper'));

                // add picture and video
                const media = $('.media-icon a')
                    .toArray()
                    .map((elem) => rootUrl + elem.attribs.href);
                let photo, video;
                await Promise.all(
                    media.map(async (medium) => {
                        if (medium.includes('/photo/')) {
                            photo = await fetchPhoto(ctx, medium);
                        } else if (medium.includes('/video/')) {
                            video = await fetchVideo(ctx, medium);
                        }
                    })
                );

                item.description = art(path.join(__dirname, 'templates/news.art'), { description, photo, video });

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
