import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/channel/:channel',
    categories: ['social-media'],
    example: '/vimeo/channel/bestoftheyear',
    parameters: { channel: 'channel name can get from url like `bestoftheyear` in  [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) .' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['vimeo.com/channels/:channel', 'vimeo.com/channels/:channel/videos', 'vimeo.com/channels/:channel/videos/:sort/:format'],
        },
    ],
    name: 'Channel',
    maintainers: ['MisteryMonster'],
    handler,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const url = `https://vimeo.com/channels/${channel}/videos`;
    const page1 = await got({
        method: 'get',
        url: `${url}/page:1/sort:date/format:detail`,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
    const page2 =
        channel === `bestoftheyear`
            ? await got({
                  method: 'get',
                  url: `${url}/page:2/sort:date/format:detail`,
                  headers: {
                      'X-Requested-With': 'XMLHttpRequest',
                  },
              })
            : '';
    const pagedata = [...page1.data, ...page2.data];
    const $ = load(pagedata);
    const list = $('ol li.clearfix');

    const description = await Promise.all(
        list.get().map((item) => {
            item = $(item);
            const link = item.find('.more').attr('href');
            return cache.tryGet(link, async () => {
                const response2 = await got({
                    method: 'get',
                    url: `https://vimeo.com${link}/description?breeze=1`,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)  ',
                    },
                });
                const articledata = response2.data;
                const $2 = load(articledata);
                $2('span').remove();
                return $2.html();
            });
        })
    );
    return {
        title: `${channel} | Vimeo channel`,
        link: url,
        item: list
            .map((index, item) => {
                item = $(item);
                const title = item.find('.title a').text();
                const author = item.find('.meta a').text();
                return {
                    title,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        videoUrl: item.find('.more').attr('href'),
                        vdescription: description[index] || '',
                    }),
                    pubDate: parseDate(item.find('time').attr('datetime')),
                    link: `https://vimeo.com${item.find('.more').attr('href')}`,
                    author,
                };
            })
            .get(),
    };
}
