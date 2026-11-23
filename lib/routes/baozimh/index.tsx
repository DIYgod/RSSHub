import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { isOnSite } from '@/utils/valid-host';

import { getGatekeeperHeaders } from './gatekeeper';

const rootUrl = 'https://www.baozimh.com';

export const route: Route = {
    path: '/comic/:name',
    categories: ['anime'],
    example: '/baozimh/comic/guowangpaiming-shiricaofu',
    parameters: { name: '漫画名称，在漫画链接可以得到(`comic/` 后的那段)' },
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
            source: ['www.baozimh.com/comic/:name'],
        },
    ],
    name: '订阅漫画',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const name = ctx.req.param('name');
    const url = `${rootUrl}/comic/${name}`;

    const headers = await getGatekeeperHeaders();
    const response = await ofetch(url, { headers });
    const $ = load(response);
    const comicTitle = $('div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > h1').text();
    const list = $('#chapter-items')
        .first()
        .children()
        .toArray()
        .map((item): DataItem => {
            const title = $(item).find('span').text();
            const link = new URL($(item).find('a').attr('href')!, rootUrl).href;

            return {
                title,
                link,
            };
        });

    // more chapters
    const otherList = $('#chapters_other_list')
        .first()
        .children()
        .toArray()
        .map((item): DataItem => {
            const title = $(item).find('span').text();
            const link = new URL($(item).find('a').attr('href')!, rootUrl).href;

            return {
                title,
                link,
            };
        });
    const combinedList = [...list, ...otherList].toReversed();

    const items = await pMap(
        combinedList,
        (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'baozimh.com')) {
                return item;
            }
            return cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!, { headers });
                const $ = load(detailResponse);
                item.description = renderToString(
                    <>
                        {$('.comic-contain')
                            .find('amp-img')
                            .toArray()
                            .map((img) => (
                                <img src={$(img).attr('src')} />
                            ))}
                    </>
                );

                return item;
            });
        },
        { concurrency: 3 }
    );

    return {
        title: `包子漫画-${comicTitle}`,
        description: $('.comics-detail__desc').text(),
        link: url,
        language: 'zh-TW',
        item: items,
    };
}
