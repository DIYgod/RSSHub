import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import logger from '@/utils/logger';

const renderFanBox = (media) =>
    art(path.join(__dirname, 'templates/fancybox.art'), {
        media,
    });

const renderDesc = (media, desc) =>
    art(path.join(__dirname, 'templates/description.art'), {
        media: renderFanBox(media),
        desc,
    });

export const route: Route = {
    path: '/:type?/:category?',
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'ins';
    const category = ctx.req.param('category') ?? (type === 'ins' ? 'all' : 's00001');
    const link = `https://news.mingpao.com/rss/${type}/${category}.xml`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link, {
                        headers: {
                            Referer: 'https://news.mingpao.com/',
                        },
                    });
                } catch (error) {
                    if (error instanceof got.MaxRedirectsError) {
                        logger.error(`MaxRedirectsError when requesting ${decodeURIComponent(item.link)}`);
                        return item;
                    }
                    throw error;
                }

                const $ = load(response.data);
                const fancyboxImg = $('a.fancybox').length ? $('a.fancybox') : $('a.fancybox-buttons');

                // remove unwanted elements
                $('div.ad300ins_m').remove();
                $('div.clear, div.inReadLrecGroup, div.clr').remove();
                $('div#ssm2').remove();
                $('iframe').remove();
                $('p[dir=ltr]').remove();

                // extract categories
                item.category = item.categories;

                // fix fancybox image
                const fancybox = fancyboxImg.toArray().map((e) => {
                    e = $(e);
                    const href = new URL(e.attr('href'));
                    let video;
                    if (href.hostname === 'videop.mingpao.com') {
                        video = new URL(href.searchParams.get('file'));
                        video.hostname = 'cfrvideo.mingpao.com'; // use cloudflare cdn
                        video = video.href;
                    }
                    return {
                        href: href.href,
                        title: e.attr('title'),
                        video,
                    };
                });

                // remove unwanted key value
                delete item.categories;
                delete item.content;
                delete item.contentSnippet;
                delete item.creator;
                delete item.isoDate;

                item.description = renderDesc(fancybox, $('.txt4').html() ?? $('.article_content.line_1_5em').html());
                item.pubDate = parseDate(item.pubDate);
                item.guid = item.link.includes('?') ? item.link : item.link.substring(0, item.link.lastIndexOf('/'));

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
}
