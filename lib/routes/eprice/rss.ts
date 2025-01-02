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
import InvalidParameterError from '@/errors/types/invalid-parameter';
const allowRegion = new Set(['tw', 'hk']);

export const route: Route = {
    path: '/:region?',
    categories: ['new-media'],
    example: '/eprice/tw',
    parameters: { region: '地区，预设为 tw' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新消息',
    maintainers: ['TonyRL'],
    handler,
    description: `地区：

  | hk   | tw   |
  | ---- | ---- |
  | 香港 | 台湾 |`,
};

async function handler(ctx) {
    const region = ctx.req.param('region') ?? 'tw';
    if (!allowRegion.has(region)) {
        throw new InvalidParameterError('Invalid region');
    }

    const feed = await parser.parseURL(`https://www.eprice.com.${region}/news/rss.xml`);

    for (const e of feed.items) {
        e.link = e.link.replace(/^http:\/\//i, 'https://');
    }

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        Referer: `https://www.eprice.com.${region}`,
                    },
                });

                const $ = load(response.data);

                // remove unwanted elements
                $('noscript').remove();
                $('div[id^=dablewidget]').remove();
                $('div[class^=parallax-ads]').remove();
                $('.adsbygoogle, .join-eprice-fb, .teads').remove();
                $('div.ad-336x280-g, div.ad-728x90-g').remove();
                $('div.clear, div.news-vote, div.signature').remove();
                $('ul.inner, ul.navigator, ul.infobar').remove();
                $('iframe[src^="https://www.facebook.com/plugins/like.php"]').remove();

                // extract categories
                item.category = item.categories;

                // fix lazyload image
                $('a').each((_, e) => {
                    e = $(e);
                    if (e.attr('href') && e.attr('href').endsWith('.jpg')) {
                        e.after(
                            art(path.join(__dirname, 'templates/image.art'), {
                                alt: e.attr('title'),
                                src: e.attr('href'),
                            })
                        );
                        e.remove();
                    }
                });
                $('img').each((_, e) => {
                    e = $(e);
                    if (e.attr('data-original')) {
                        e.attr('src', e.attr('data-original'));
                    }
                });

                // remove unwanted key value
                delete item.categories;
                delete item.content;
                delete item.contentSnippet;
                delete item.creator;
                delete item.enclosure;
                delete item.isoDate;

                // tw || tw || hk || hk || hk
                item.description = $('div.user-comment-block').html() || $('div.content').html() || $('li.inner').html() || $('div.section-content').html() || $('.article__content').html();
                item.pubDate = parseDate(item.pubDate);

                return item;
            })
        )
    );

    const ret = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };

    ctx.set('json', ret);
    return ret;
}
