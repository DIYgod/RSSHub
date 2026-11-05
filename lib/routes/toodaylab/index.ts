import { type CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

dayjs.extend(utc);

export const route: Route = {
    path: '/posts',
    categories: ['new-media'],
    example: '/toodaylab/posts',
    radar: [
        {
            source: ['toodaylab.com/posts'],
            target: '/posts',
        },
    ],
    name: '滚动',
    maintainers: ['nczitzk'],
    handler,
};

function parsePubDate(value?: string) {
    if (!value?.trim()) {
        return;
    }

    const calendar = value.match(/^(今天|昨天|前天)\s+(\d{1,2}:\d{2})$/);
    let date: Date;
    if (calendar) {
        const sourceDay = dayjs()
            .utcOffset(8)
            .subtract(calendar[1] === '昨天' ? 1 : calendar[1] === '前天' ? 2 : 0, 'day')
            .format('YYYY-MM-DD');
        date = parseDate(`${sourceDay} ${calendar[2]} +08:00`, 'YYYY-MM-DD HH:mm Z');
    } else if (/[年日月]/.test(value)) {
        const sourceDate = value.includes('年') ? value : `${dayjs().utcOffset(8).year()}年${value}`;
        date = parseDate(`${sourceDate} +08:00`, 'YYYY年M月D日 HH:mm Z');
    } else {
        date = parseRelativeDate(value);
    }
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function getDescription(content: CheerioAPI) {
    const article = content('div.post-content');
    if (article.length) {
        return article.html();
    }
    const special = content('body > div.excerpt').nextUntil('div.function-block').filter('div, section, main').not('.wechat-dialog');
    if (special.length) {
        special.find('script, style').remove();
        return content.html(special);
    }
    return;
}

export async function handler(ctx) {
    const path = getSubPath(ctx);
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 30;

    const isHot = path === '/hot';

    const rootUrl = 'https://www.toodaylab.com';
    const currentUrl = new URL(isHot ? '/posts' : path, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = isHot
        ? $('div.hot-list')
              .first()
              .find('a')
              .slice(0, limit)
              .toArray()
              .map((item): DataItem => {
                  const $item = $(item);

                  return {
                      title: $item.find('div.hot-item p').text(),
                      link: new URL($item.prop('href')!, rootUrl).href,
                  };
              })
        : $('div.single-post')
              .slice(0, limit)
              .toArray()
              .map((item): DataItem => {
                  const $item = $(item);

                  const a = $item.find('p.title a');

                  const pubDate = $item
                      .find('div.left-infos p')
                      .text()
                      .trim()
                      .split(/\/\/\s/)
                      .pop();

                  return {
                      title: a.text(),
                      link: new URL(a.prop('href')!, rootUrl).href,
                      description: $item.find('p.excerpt').html(),
                      author: $item.find('div.left-infos p a').text().trim(),
                      pubDate: parsePubDate(pubDate),
                  };
              });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`toodaylab:detail:v4:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const pubDate = content('div.left-infos p')
                    .text()
                    .trim()
                    .split(/\/\/\s/)
                    .pop();

                return {
                    title: content('h1').text() || undefined,
                    description: getDescription(content),
                    author: content('div.left-infos p a').text().trim() || undefined,
                    category: content('div.right-infos a')
                        .slice(1)
                        .toArray()
                        .map((c) => content(c).text().replace(/#/, '')),
                    pubDate: parsePubDate(pubDate),
                    upvotes: content('#like_count').text() ? Number(content('#like_count').text()) : 0,
                    comments: Number(content('div.right-infos a').first().text()) || 0,
                };
            });

            return {
                ...item,
                ...detail,
                title: detail.title || item.title,
                description: detail.description ?? item.description,
                pubDate: item.pubDate ?? detail.pubDate,
                author: detail.author ?? item.author,
            };
        },
        { concurrency: 3 }
    );

    const title = $('title').text().split(/\s-/, 1)[0];
    const icon = $('link[rel="apple-touch-icon"]').last().prop('href');

    return {
        item: items,
        title: isHot ? title.replace(/[^|]+/, '最热 ') : title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        image: $('h3.logo a img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('h3.logo a img').prop('alt'),
    };
}
