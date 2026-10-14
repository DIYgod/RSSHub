import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderBookDescription } from './templates/book';

export const route: Route = {
    path: '/book/:id?',
    categories: ['reading'],
    view: ViewType.Notifications,
    example: '/jjwxc/book/7013024',
    parameters: { id: '作品 id，可在对应作品页中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作品章节',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!id || !/^[1-9]\d*$/.test(id)) {
        throw new InvalidParameterError('A positive numeric novel ID is required.');
    }
    const limit = getRouteLimit(ctx, 100);

    const rootUrl = 'https://www.jjwxc.net';
    const currentUrl = new URL(`onebook.php?novelid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const author = $('meta[name="Author"]').prop('content');
    const keywords = $('meta[name="Keywords"]').prop('content')?.split(/,/) ?? [];

    keywords.pop();

    const category = keywords.pop();

    let items = $('tr[itemprop="chapter"]')
        .toArray()
        .map((item): DataItem & { link: string; isVip?: boolean; isLock: boolean } => {
            const $item = $(item);

            const chapterId = $item.find('td').first().text().trim();
            const chapterName = $item.find('span[itemprop="headline"]').text().trim();
            const chapterIntro = $item.find('td').eq(2).text().trim();
            const chapterUrl = new URL(`onebook.php?novelid=${id}&chapterid=${chapterId}`, rootUrl).href;
            const chapterWords = $item.find('td[itemprop="wordCount"]').text();
            const chapterClicks = $item.find('td.chapterclick').text();
            const chapterUpdatedTime = $item.find('td').last().text().trim();

            const isVip = $item.find('span[itemprop="headline"] font').last().text() === '[VIP]';
            const isLock = $item.find('td').eq(1).last().text().trim() === '[锁]';

            return {
                title: `${chapterName} ${chapterIntro}`,
                link: chapterUrl,
                description: renderBookDescription({
                    chapterId,
                    chapterName,
                    chapterIntro,
                    chapterUrl,
                    chapterWords,
                    chapterClicks,
                    chapterUpdatedTime,
                }),
                author,
                category: [isVip ? 'VIP' : '', ...(category?.split(/\s/) ?? [])].filter(Boolean),
                guid: `jjwxc-${id}#${chapterId}`,
                pubDate: /\d{4}-\d{1,2}-\d{1,2}/.test(chapterUpdatedTime) ? timezone(parseDate(chapterUpdatedTime), 8) : undefined,
                isVip,
                isLock,
            };
        });

    items = items.toReversed();
    const datesKnown = items.every((item) => item.pubDate instanceof Date && !Number.isNaN(item.pubDate.getTime()));
    if (ctx.req.query('sorted') !== 'false' && datesKnown) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
    }
    if (ctx.req.query('sorted') === 'false' || datesKnown) {
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        (item) =>
            item.isLock
                ? Promise.resolve(item)
                : cache.tryGet(item.link, async () => {
                      if (!item.isVip) {
                          const { data: detailResponse } = await got(item.link, {
                              responseType: 'buffer',
                          });

                          const content = load(iconv.decode(detailResponse, 'gbk'));

                          content('span.favorite_novel').parent().remove();

                          item.description += renderBookDescription({
                              description: content('div.novelbody').html() || undefined,
                          });
                      }

                      delete item.isVip;

                      return item;
                  }),
        { concurrency: 3 }
    );

    const logoEl = $('div.logo a img');
    const imageSource = logoEl.prop('src');
    const image = imageSource ? new URL(imageSource, currentUrl).href : undefined;
    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items.map(({ isVip: _isVip, isLock: _isLock, ...item }) => item),
        title: `${logoEl.prop('alt')?.replace(/logo/, '') || '晋江文学城'} | ${author ?? ''}${keywords[0] ?? ''}`,
        link: currentUrl,
        description: $('span[itemprop="description"]').text(),
        language: 'zh' as const,
        image,
        icon,
        logo: icon,
        author: $('meta[name="Author"]').prop('content'),
    };
}
