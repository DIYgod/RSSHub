import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:language?/:category?/:type?',
    categories: ['multimedia'],
    example: '/7mmtv/zh/censored_list/all',
    parameters: { language: 'Language, see below, `en` as English by default', category: 'Category, see below, `censored_list` as Censored by default', type: 'Server, see below, all server by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `**Language**

| English | 日本語 | 한국의 | 中文 |
| ------- | ------ | ------ | ---- |
| en      | ja     | ko     | zh   |

  **Category**

| Chinese subtitles AV | Censored       | Amateur          | Uncensored       | Asian self-timer | H comics     |
| -------------------- | -------------- | ---------------- | ---------------- | ---------------- | ------------ |
| chinese\_list        | censored\_list | amateurjav\_list | uncensored\_list | amateur\_list    | hcomic\_list |

| Chinese subtitles AV random | Censored random  | Amateur random     | Uncensored random  | Asian self-timer random | H comics random |
| --------------------------- | ---------------- | ------------------ | ------------------ | ----------------------- | --------------- |
| chinese\_random             | censored\_random | amateurjav\_random | uncensored\_random | amateur\_random         | hcomic\_random  |

  **Server**

| All Server | fembed(Full DL) | streamsb(Full DL) | doodstream | streamtape(Full DL) | avgle | embedgram | videovard(Full DL) |
| ---------- | --------------- | ----------------- | ---------- | ------------------- | ----- | --------- | ------------------ |
| all        | 21              | 30                | 28         | 29                  | 17    | 34        | 33                 |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';
    const category = ctx.req.param('category') ?? 'censored_list';
    const type = ctx.req.param('type') ?? 'all';

    const rootUrl = 'https://7mmtv.sx';
    const currentUrl = `${rootUrl}/${language}/${category}/${type}/1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.video')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('.video-title a');
            return {
                title: title.text(),
                author: item.find('.video-channel').text(),
                pubDate: parseDate(item.find('.small').text()),
                link: title.attr('href'),
                poster: item.find('img').attr('data-src'),
                video: item.find('video').attr('data-src'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    cover: content('.content_main_cover img').attr('src'),
                    images: content('.owl-lazy')
                        .toArray()
                        .map((i) => content(i).attr('data-src')),
                    description: content('.video-introduction-images-text').html(),
                    poster: item.poster,
                    video: item.video,
                });

                item.category = content('.categories a')
                    .toArray()
                    .map((a) => content(a).text());

                delete item.poster;
                delete item.video;

                return item;
            })
        )
    );

    return {
        title: $('title')
            .text()
            .replace(/ - Watch JAV Online/, ''),
        link: currentUrl,
        item: items,
        description: $('meta[name="description"]').attr('content'),
    };
}
