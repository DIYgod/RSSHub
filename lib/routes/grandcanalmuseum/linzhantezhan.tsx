import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateRange } from '@/utils/time';

import { namespace } from './namespace';

export const route: Route = {
    path: '/linzhantezhan',
    categories: ['travel'],
    example: '/grandcanalmuseum/linzhantezhan',
    radar: [
        {
            source: ['www.grandcanalmuseum.cn/linzhantezhan.html'],
            target: '/linzhantezhan',
        },
    ],
    name: '临展特展',
    maintainers: ['magazian'],
    handler: async (): Promise<Data> => {
        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.grandcanalmuseum.cn';
        const listUrl = `${baseUrl}/linzhantezhan.html`;
        const response = await ofetch(listUrl);
        const $ = load(response);

        const rawItems = $('.list_zhanlan .list > ul > li > a')
            .toArray()
            .map((el) => {
                const $a = $(el);
                const href = $a.attr('href')!;
                const link = new URL(href, baseUrl).href;
                const title = $a.find('.title').text();
                const imgUrl = $a.find('.img img').attr('src');
                return { title, link, imgUrl };
            });

        const items = await pMap(
            rawItems,
            (item) =>
                cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $d = load(detailResponse);

                    // Extract location from the structured lanmu bar
                    const locationSpan = $d('.article .lanmu span')
                        .toArray()
                        .map((el) => $d(el).text().trim())
                        .find((text) => text.startsWith('地点：'));
                    const location = locationSpan?.replace('地点：', '');

                    let fullDuration = '';
                    $d('.zhengwen p').each((_, el) => {
                        const text = $d(el).text().trim();
                        const match = text.match(/(?:展览时间|展期)：(.*)/);
                        if (match) {
                            fullDuration = match[1];
                        }
                    });

                    const { startDate, endDate } = parseDateRange(fullDuration);

                    const description = renderToString(
                        <div>
                            <img src={item.imgUrl} />
                            <br />
                            <div>{raw($d('.zhengwen').html() ?? '')}</div>
                        </div>
                    );

                    return {
                        title: item.title,
                        link: item.link,
                        description,
                        _extra: {
                            museumName,
                            location,
                            startDate,
                            endDate,
                        },
                    };
                }),
            { concurrency: 3 }
        );

        return {
            title: `${museumName} - 临展特展`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
