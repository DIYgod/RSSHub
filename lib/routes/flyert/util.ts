import path from 'node:path';

import type { CheerioAPI } from 'cheerio';

import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.flyert.com.cn';

/**
 * Parses a list of articles based on a CheerioAPI object and a limit.
 * @param $ The CheerioAPI object.
 * @param limit The maximum number of articles to parse.
 * @returns An array of parsed article objects.
 */
const parseArticleList = ($: CheerioAPI, limit: number) =>
    $('div.comiis_wzli')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('div.wzbt').text().trim();
            const image = item.find('div.wzpic img').prop('src');
            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: item.find('div.wznr').html(),
            });
            const pubDate = item.find('div.subcat span.y').contents()?.eq(2)?.text().trim() ?? undefined;
            const link = new URL(item.find('div.wzbt a').prop('href'), rootUrl).href;

            return {
                title,
                description,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                link,
                author: item.find('div.subcat span.y a').first().text(),
                content: {
                    html: description,
                    text: item.find('div.wznr').text(),
                },
                image,
                banner: image,
            };
        });

/**
 * Parses a list of posts based on a CheerioAPI object and a limit.
 * @param $ The CheerioAPI object.
 * @param limit The maximum number of posts to parse.
 * @returns An array of parsed post objects.
 */
const parsePostList = ($: CheerioAPI, limit: number) =>
    $('div.comiis_postlist')
        .toArray()
        .filter((item) => {
            item = $(item);

            return item
                .find('span.comiis_common a[data-track]')
                .toArray()
                .some((a) => {
                    a = $(a);

                    const dataTrack = a.attr('data-track') || '';
                    return dataTrack.endsWith('文章');
                });
        })
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const aEl = $(
                item
                    .find('span.comiis_common a[data-track]')
                    .toArray()
                    .find((a) => {
                        a = $(a);

                        const dataTrack = a.attr('data-track') || '';
                        return dataTrack.endsWith('文章');
                    })
            );

            const pubDate = item.find('span.author_b span').prop('title') || undefined;

            return {
                title: aEl.text().trim(),
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                link: new URL(aEl.prop('href'), rootUrl).href,
                author: item.find('a.author_t').text().trim(),
            };
        });

/**
 * Parses an article based on a CheerioAPI object and an item.
 * @param $$ The CheerioAPI object.
 * @param item The item to parse.
 * @returns The parsed article object.
 */
const parseArticle = ($$: CheerioAPI, item) => {
    const title = $$('h1.ph').text().trim();
    const description = art(path.join(__dirname, 'templates/description.art'), {
        intro: $$('div.s').text() || undefined,
        description: $$('div#artMain').html(),
    });
    const pubDate =
        $$('p.xg1')
            .contents()
            .first()
            .text()
            .trim()
            ?.match(/(\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2})/)?.[1] ?? undefined;
    const guid = `flyert-${item.link.split(/=/).pop()}`;

    item.title = title;
    item.description = description;
    item.pubDate = pubDate ? timezone(parseDate(pubDate), +8) : item.pubDate;
    item.author = $$('p.xg1 a').first().text();
    item.guid = guid;
    item.id = guid;
    item.content = {
        html: description,
        text: $$('div#artMain').text(),
    };

    return item;
};

/**
 * Parses a post based on a CheerioAPI object and an item.
 * @param $$ The CheerioAPI object.
 * @param item The item to parse.
 * @returns The parsed post object.
 */
const parsePost = ($$: CheerioAPI, item) => {
    $$('img.zoom').each((_, el) => {
        el = $$(el);

        el.replaceWith(
            art(path.join(__dirname, 'templates/description.art'), {
                images:
                    el.prop('zoomfile') || el.prop('file')
                        ? [
                              {
                                  src: el.prop('zoomfile') || el.prop('file'),
                                  alt: el.prop('alt') || el.prop('title'),
                              },
                          ]
                        : undefined,
            })
        );
    });

    $$('i.pstatus').remove();
    $$('div.tip').remove();

    const title = $$('span#thread_subject').text().trim();
    const description = $$('div.post_message').first().html();
    const pubDate = $$('span[title]').first().prop('title');

    const tid = item.link.match(/tid=(\d+)/)?.[1] ?? undefined;
    const guid = tid ? `flyert-${tid}` : undefined;

    item.title = title;
    item.description = description;
    item.pubDate = pubDate ? timezone(parseDate(pubDate), +8) : item.pubDate;
    item.author = $$('a.kmxi2').first().text();
    item.guid = guid;
    item.id = guid;
    item.content = {
        html: description,
        text: $$('div.post_message').first().text(),
    };

    return item;
};

export { parseArticle, parseArticleList, parsePost, parsePostList, rootUrl };
