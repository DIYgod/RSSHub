// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://lvv2.com';

const titleMap = {
    'sort-realtime': {
        't-month': '24小时榜 一月内',
        't-week': '24小时榜 一周内',
        't-day': '24小时榜 一天内',
        't-hour': '24小时榜 一小时内',
    },
    'sort-hot': '热门',
    'sort-new': '最新',
    'sort-score': {
        't-month': '得分 一月内',
        't-week': '得分 一周内',
        't-day': '得分 一天内',
        't-hour': '得分 一小时内',
    },
};

export default async (ctx) => {
    const channel = ctx.req.param('channel');
    const sort = (channel === 'sort-realtime' || channel === 'sort-score') && !ctx.req.param('sort') ? 't-week' : ctx.req.param('sort');
    const url = `${rootUrl}/${channel}/${sort}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('#top-content-news > div')
        .map((_, item) => ({
            title: $(item).find('div.md > a').text(),
            link: new URL($(item).find('div.md > a').attr('href'), rootUrl).href.replace(/(https:\/\/lvv2\.com.*?)\/title.*/, '$1'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);

                item.pubDate = timezone(parseDate(content('time').attr('datetime')), +8);
                item.author = content('a.author').text();
                const link = content('h2.title > a.title').attr('href');
                item.description =
                    new URL(link, item.link).hostname === 'instant.lvv2.com'
                        ? await cache.tryGet(link, async () => {
                              const articleResponse = await got(link);
                              const article = load(articleResponse.data);

                              const description = article('#_tl_editor')
                                  .html()
                                  .replaceAll(/(<img.*?)data-src(.*?>)/g, '$1src$2');

                              return description;
                          })
                        : art(path.join(__dirname, 'templates/outlink.art'), {
                              outlink: link,
                          });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `lvv2 - ${sort ? titleMap[channel][sort] : titleMap[channel]} 24小时点击 Top 10`,
        link: url,
        item: items,
    });
};
