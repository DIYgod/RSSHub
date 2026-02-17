import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { conference } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 12;

    const rootUrl = 'https://www.infoq.com';
    const currentUrl = new URL(`${conference ? `${conference}/` : ''}presentations/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul[data-tax="presentations"] li[data-path]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h3.card__title a');

            const title = a.prop('title') || a.text().trim();
            const image = item.find('img.card__image').prop('src');
            const description = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: item.find('p.card__excerpt').text(),
            });
            const link = new URL(a.prop('href'), rootUrl).href;
            const guid = `infoq-${item.prop('data-path').replace(/^\//, '')}`;
            const length = item.find('div.card__length').text() || undefined;

            return {
                title,
                description,
                pubDate: parseDate(item.find('span.card__date span').text().trim()),
                link,
                category: item
                    .find('div.card__topics')
                    .toArray()
                    .map((c) => $(c).text().trim()),
                author: item
                    .find('div.card__authors a')
                    .toArray()
                    .map((a) => $(a).text().trim())
                    .join('/'),
                guid,
                id: guid,
                content: {
                    html: description,
                    text: item.find('p.card__excerpt').text(),
                },
                image,
                banner: image,
                language,
                enclosure_url: length ? link : undefined,
                enclosure_type: length ? 'video/mp4' : undefined,
                enclosure_title: title,
                itunes_duration: length,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                $$('div.player').prevAll().remove();
                $$('div.event__list-box').remove();

                const length = $$('div.player__actions span').text() || undefined;

                const script = $$('script[type="text/javascript"]').text();
                const videoSrc = script.match(/P\.s\s=\s'(.*?)';/)?.[1] ?? undefined;
                const poster = script.match(/P\.c\(.*?isWideScreen,\s'(.*?)',\s/)?.[1] ?? undefined;
                const topicsStr = script.match(/var\stopicsInPage\s=\sJSON\.parse\('(.*?)'\);/)?.[1]?.replaceAll('\\', '') ?? undefined;

                if (videoSrc) {
                    $$('div.player').replaceWith(
                        renderDescription({
                            videos: [
                                {
                                    src: videoSrc,
                                    poster,
                                    type: `video/${videoSrc.split(/\./).pop()}`,
                                },
                            ],
                        })
                    );
                }

                const title = $$('meta[property="og:title"]').prop('content').trim();
                const image = $$('meta[property="twitter:image"]').prop('content') || $$('meta[property="og:image"]').prop('content');

                item.title = title;
                item.pubDate = parseDate($$('p.date').text());
                item.link = $$('meta[property="og:url"]').prop('content');
                item.category = topicsStr ? JSON.parse(topicsStr).map((t) => t.name) : $$('meta[name="keywords"]').prop('content').split(/,/);
                item.author = $$('ul.authors a.author__link')
                    .toArray()
                    .map((a) => $$(a).text())
                    .join('/');

                $$('div.article__content').nextAll().remove();

                const description = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('article.article').html(),
                });

                item.description = description;
                item.content = {
                    html: description,
                    text: $$('article.article').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;
                item.enclosure_url = videoSrc;
                item.enclosure_type = item.enclosure_url ? 'video/mp4' : undefined;
                item.enclosure_title = title;
                item.itunes_duration = length;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = $('meta[property="og:image"]').prop('content');

    return {
        title,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/presentations/:conference?',
    name: 'Presentations',
    url: 'www.infoq.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/infoq/presentations',
    parameters: { conference: 'Conference, all by default, can be found in URL' },
    description: `::: tip
  If you subscribe to [InfoQ Live Jan 2024](https://www.infoq.com/infoq-live-jan-2024/presentations/)，where the URL is \`https://www.infoq.com/infoq-live-jan-2024/presentations/\`, extract the part \`https://www.infoq.com/\` to the end, which is \`/presentations/\`, and use it as the parameter to fill in. Therefore, the route will be [\`/infoq/presentations/infoq-live-jan-2024\`](https://rsshub.app/infoq/presentations/infoq-live-jan-2024).
:::
    `,
    categories: ['programming'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.infoq.com/presentations', 'www.infoq.com/:conference/presentations'],
            target: (params) => {
                const conference = params.conference;

                return `/presentations${conference ? `/${conference}` : ''}`;
            },
        },
    ],
};
