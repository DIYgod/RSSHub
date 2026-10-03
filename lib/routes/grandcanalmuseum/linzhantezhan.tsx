import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';

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

        const items = await Promise.all(
            rawItems.map((item) =>
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
                        if (text.includes('展览时间：')) {
                            fullDuration = text.split('展览时间：', 2)[1];
                        }
                    });

                    const { startDate, endDate } = parseDateRange(fullDuration);
                    const pubDate = startDate ? parseDate(startDate) : undefined;

                    const description = renderToString(
                        <div>
                            <img src={item.imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location || '参考详情'}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate || '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate || '未定/常设'}
                            </p>
                            {fullDuration && (
                                <p>
                                    <small>原始展期：{fullDuration}</small>
                                </p>
                            )}
                        </div>
                    );

                    return {
                        title: item.title,
                        link: item.link,
                        pubDate,
                        description,
                        _extra: {
                            museumName,
                            location,
                            startDate,
                            endDate,
                        },
                    };
                })
            )
        );

        return {
            title: `${museumName} - 临展特展`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
