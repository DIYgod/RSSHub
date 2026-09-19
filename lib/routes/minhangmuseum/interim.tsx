import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const parseExhibitionDuration = (duration?: string) => {
    const [startDate, endDate] = duration?.match(/\d{4}年\d{1,2}月\d{1,2}日/g)?.map((d) => d.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/, (_, y, m, d) => `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)) ?? [];

    return {
        startDate,
        endDate,
    };
};

export const route: Route = {
    path: '/interim',
    categories: ['travel'],
    example: '/minhangmuseum/interim',
    name: '临时展览',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['minhangmuseum.shmh.gov.cn/weixin/interim/list.htm'],
            target: '/interim',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://minhangmuseum.shmh.gov.cn';
        const listUrl = `${baseUrl}/weixin/interim/list.htm`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const listItems = $('#courseContent li, .ex-ul li')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const href = $el.find('a').attr('href');
                if (!href) {
                    return null;
                }
                const itemLink = new URL(href, baseUrl).href;
                const title = $el.find('.ex-li-title').text();
                const fullDuration = $el.find('.apply-time').text();
                const imgUrl = $el.find('.ex-li-img img').attr('src');

                return {
                    title,
                    itemLink,
                    fullDuration,
                    imgUrl,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        const items: DataItem[] = await Promise.all(
            listItems.map((item) =>
                cache.tryGet(item.itemLink, async () => {
                    const detailResponse = await ofetch(item.itemLink);
                    const $detail = load(detailResponse);

                    let location: string | undefined;
                    $detail('.activity-detail-time ul li').each((_, el) => {
                        const label = $detail(el).find('.detail-time-lf').text();
                        const val = $detail(el).find('.detail-time-rig').text();
                        if (label.includes('地点') && val) {
                            location = val;
                        }
                    });

                    const { startDate, endDate } = parseExhibitionDuration(item.fullDuration);
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
                            <p>
                                <small>原始展期：{item.fullDuration}</small>
                            </p>
                        </div>
                    );

                    return {
                        title: item.title,
                        link: item.itemLink,
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
            title: `${museumName} - 临时展览`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
