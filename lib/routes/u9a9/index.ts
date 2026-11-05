import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://u9a9.com';

export const route: Route = {
    path: ['/:preview?', '/search/:keyword/:preview?'],
    example: '/u9a9/search/新片速递',
    features: { supportBT: true },
    radar: [
        {
            source: ['u9a9.com/'],
            target: '',
        },
    ],
    name: 'Search',
    maintainers: ['TonyRL'],
    handler,
    url: 'u9a9.com/',
};

async function handler(ctx) {
    const { preview, keyword } = ctx.req.param();

    let link;
    let title;
    if (keyword) {
        link = `${baseUrl}/?type=2&search=${encodeURIComponent(keyword)}`;
        title = `${keyword} - U9A9`;
    } else {
        link = baseUrl;
        title = 'U9A9';
    }

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('table tr')
        .slice(1) // skip thead
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('td').eq(1).find('a');
            const date = $item.find('td').eq(4).text().trim();
            const pubDate = date ? parseDate(date, 'YYYY-MM-DD HH:mm:ss', true) : undefined;
            return {
                title: a.attr('title')!,
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? timezone(pubDate, 8) : undefined,

                enclosure_url: new URL($item.find('td').eq(2).find('a').first().attr('href')!, baseUrl).href,
                enclosure_type: 'application/x-bittorrent',
            };
        });

    const items = preview
        ? await pMap(
              list,
              async (item) => ({
                  ...item,
                  ...(await cache.tryGet(`u9a9:detail:v2:${item.link}`, async () => {
                      const { data: response } = await got(item.link);
                      const $ = load(response);

                      return { description: $('.panel-body').eq(1).html() };
                  })),
              }),
              { concurrency: 3 }
          )
        : list;

    return {
        title,
        link,
        item: items,
    };
}
