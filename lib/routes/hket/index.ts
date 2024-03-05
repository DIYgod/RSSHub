// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
import { art } from '@/utils/render';

const urlMap = {
    srac: {
        baseUrl: 'https://china.hket.com',
    },
    sran: {
        baseUrl: 'https://inews.hket.com',
    },
    srat: {
        baseUrl: 'https://topick.hket.com',
    },
    sraw: {
        baseUrl: 'https://wealth.hket.com',
    },
};

export default async (ctx) => {
    const { category = 'sran001' } = ctx.req.param();
    const baseUrl = urlMap[category.substring(0, 4)].baseUrl;

    const { data: response } = await got(`${baseUrl}/${category}`);

    const $ = load(response);

    const list = $('div.listing-title > a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: item.attr('href').startsWith('http')
                    ? // remove tracking parameters
                      baseUrl + item.attr('href').split('?')[0].substring(0, item.attr('href').lastIndexOf('/'))
                    : item.attr('href').split('?')[0].substring(0, item.attr('href').lastIndexOf('/')),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.startsWith('https://invest.hket.com/') || item.link.startsWith('https://ps.hket.com/')) {
                    let data;

                    data = await (item.link.startsWith('https://invest.hket.com/')
                        ? got.post('https://invest.hket.com/content-api-middleware/content', {
                              headers: {
                                  referer: item.link,
                              },
                              json: {
                                  id: item.link.split('/').pop(),
                                  channel: 'invest',
                              },
                          })
                        : got('https://data02.hket.com/content', {
                              headers: {
                                  referer: item.link,
                              },
                              searchParams: {
                                  id: item.link.split('/').pop(),
                                  channel: 'epc',
                              },
                          }));
                    data = data.data;

                    item.pubDate = timezone(parseDate(data.displayDate), +8);
                    item.updated = timezone(parseDate(data.lastModifiedDate), +8);
                    item.author = data.authors?.map((e) => e.name).join(', ');
                    item.description = data.content.full || data.content.partial;
                    item.category = data.contentTags?.map((e) => e.name);

                    return item;
                }

                const { data: response } = await got(item.link);
                const $ = load(response);

                item.category = $('.contentTags-container > .hotkey-container-wrapper > .hotkey-container > a')
                    .toArray()
                    .map((e) => $(e).text().trim());

                // remove unwanted elements
                $('source').remove();
                $('p.article-detail_caption, .article-extend-button, span.click-to-enlarge').remove();
                $('.loyalty-promotion-container, .relatedContents-container, .article-details-center-sharing-btn, .article-detail_login').remove();
                $('.gallery-related-container, .contentTags-container').remove();
                $('.listing-widget-126, div.template-default.hket-row.no-padding.detail-widget').remove();

                // remove ads
                $('.ad_MobileMain, .adunit, .native-ad').remove();

                $('span').each((_, e) => {
                    if ($(e).text().startsWith('+')) {
                        $(e).remove();
                    }
                });

                // fix lazyload image and caption
                $('img').each((_, e) => {
                    e = $(e);
                    e.replaceWith(
                        art(path.join(__dirname, 'templates/image.art'), {
                            alt: e.attr('data-alt'),
                            src: e.attr('data-src') ?? e.attr('src'),
                        })
                    );
                });

                item.description = $('div.article-detail-body-container').html();
                item.pubDate = timezone(parseDate($('.article-details-info-container_date, .publish-date-time').text().trim()), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head meta[name=title]').attr('content').trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content').trim(),
        item: items,
        language: 'zh-hk',
    });

    ctx.set('json', {
        title: $('head meta[name=title]').attr('content').trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content').trim(),
        item: items,
        language: 'zh-hk',
    });
};
