import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 11;

    const rootUrl = 'https://www.logclub.com';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('li.layui-row, li.layui-timeline-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('div.newslist-txt h3 a, a.article_title').first();
            const image = item.find('img.img-hover').prop('src')?.split(/\?/)[0] ?? undefined;

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                description: renderDescription({
                    image: {
                        src: image,
                        alt: a.text(),
                    },
                    intro: item.find('p.newslist-intro, div.newslist-info-intro').text(),
                }),
                itunes_item_image: image,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('a.dl_file').each((_, el) => {
                    el = content(el);
                    el.parent().remove();
                });
                content('img').each((_, el) => {
                    el = content(el);
                    el.replaceWith(
                        renderDescription({
                            image: {
                                src: el.prop('src')?.split(/\?/)[0] ?? undefined,
                                alt: el.prop('title'),
                            },
                        })
                    );
                });

                item.title = content('h1, div.current_video_title').first().text();

                item.enclosure_url = content('video#ref_video').prop('src');
                if (item.enclosure_url) {
                    item.enclosure_type = `video/${item.enclosure_url.split(/\./).pop()}`;
                }

                item.description += renderDescription({
                    video: {
                        poster: item.itunes_item_image,
                        src: item.enclosure_url,
                        type: item.enclosure_type,
                    },
                    description: content('div.article-cont').html(),
                });
                item.author = content('div.article-info-r a')
                    .toArray()
                    .map((a) => content(a).text())
                    .join('/');
                item.category = [
                    ...new Set([
                        ...content('div.article-label-r a.label')
                            .toArray()
                            .map((c) => content(c).text()),
                        ...(content('meta[name="keywords"]')
                            .prop('content')
                            ?.split(/\s?,\s?/) ?? []),
                    ]),
                ].filter(Boolean);

                item.pubDate =
                    content('span.aritlceIn-time').length === 0
                        ? parseDate(
                              content(
                                  content('div.video_info_item, div.lc-infos div')
                                      .toArray()
                                      .findLast((i) => /\d{4}-\d{2}-\d{2}/.test(content(i).text()))
                              )
                                  .text()
                                  .split(/：/)
                                  .pop()
                                  .trim()
                          )
                        : parseDate(content('span.aritlceIn-time').text().trim());

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;
    const subtitle = $('meta[name="keywords"]').prop('content');
    const author = subtitle.split(/,/)[0];

    return {
        item: items,
        title: $('title').text().split(/-/)[0].trim(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image: new URL($('div.logo_img img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: subtitle.replaceAll(',', ''),
        author,
        itunes_author: author,
        itunes_category: 'News',
    };
}
