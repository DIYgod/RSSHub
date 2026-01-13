import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
        nsfw: true,
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
| chinese_list        | censored_list | amateurjav_list | uncensored_list | amateur_list    | hcomic_list |

| Chinese subtitles AV random | Censored random  | Amateur random     | Uncensored random  | Asian self-timer random | H comics random |
| --------------------------- | ---------------- | ------------------ | ------------------ | ----------------------- | --------------- |
| chinese_random             | censored_random | amateurjav_random | uncensored_random | amateur_random         | hcomic_random  |

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

                const cover = content('.content_main_cover img').attr('src');
                const images = content('.owl-lazy')
                    .toArray()
                    .map((i) => content(i).attr('data-src'));
                const description = content('.video-introduction-images-text').html();
                const poster = item.poster ?? '';
                const video = item.video;
                const videoMarkup = video ? `<video mute loop="loop" autoplay="autoplay" poster="${poster}"><source src="${video}"></video>` : '';

                item.description = renderToString(
                    <>
                        {cover ? <img src={cover} /> : null}
                        {video ? (
                            <>
                                <br />
                                {raw(videoMarkup)}
                                <br />
                            </>
                        ) : null}
                        {description ? raw(description) : null}
                        {images.map((image) => (image ? <img src={image} /> : null))}
                    </>
                );

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
