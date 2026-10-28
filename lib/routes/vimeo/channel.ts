import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

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
            source: ['vimeo.com/channels/:channel', 'vimeo.com/channels/:channel/videos', 'vimeo.com/channels/:channel/videos/:sort/:format', 'vimeo.com/channels/:channel/videos/:page/:sort/:format'],
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
    const $ = load(page1.data);
    const list = $('ol li.clearfix');
    const description = await pMap(
        list.toArray(),
        (item) => {
            const $item = $(item);
            const link = $item.find('.more').attr('href');
            return recoverFailure(
                cache.tryGet(link!, async () => {
                    const response2 = await got({
                        method: 'get',
                        url: `https://vimeo.com${link}/description?breeze=1`,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        headerGeneratorOptions: PRESETS.MODERN_IOS,
                    });
                    const articledata = response2.data;
                    const $2 = load(articledata);
                    $2('span').remove();
                    return $2.html();
                }),
                (error) => {
                    if (error.response?.status === 451) {
                        // The public channel summary remains available when the description is legally unavailable.
                        return $item.find('.description').html() ?? '';
                    }
                    throw error;
                }
            );
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: `${channel} | Vimeo channel`,
        link: url,
        item: list.toArray().map((item, index) => {
            const $item = $(item);
            const title = $item.find('.title a').text();
            const author = $item.find('.meta a').text();
            const publicationTime = $item.find('time').attr('datetime');
            return {
                title,
                description: renderDescription({
                    videoUrl: $item.find('.more').attr('href')!,
                    vdescription: description[index] || '',
                }),
                pubDate: publicationTime && Number.isFinite(Date.parse(publicationTime)) ? parseDate(publicationTime) : undefined,
                link: `https://vimeo.com${$item.find('.more').attr('href')}`,
                author,
            };
        }),
    };
}
async function recoverFailure<T, U>(promise: Promise<T>, recover: (error: FetchError) => U | Promise<U>): Promise<T | U> {
    try {
        return await promise;
    } catch (error) {
        if (!(error instanceof FetchError)) {
            throw error;
        }
        return recover(error);
    }
}
