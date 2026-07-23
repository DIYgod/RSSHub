import { load } from 'cheerio';
import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// Convert YYYY年M月D日 to YYYY-MM-DD
const fmtExhibitionDate = (raw: string | undefined) => {
    if (!raw) {
        return;
    }
    const d = dayjs(raw.trim(), 'YYYY年M月D日');
    return d.format('YYYY-MM-DD');
};

// used for 2026年6月24日 - 2026年9月1日
const parseExhibitionDuration = (fullDuration: string): { startDate: string | undefined; endDate: string | undefined } => {
    const [startRaw, endRaw] = fullDuration.split(' - ', 2);
    return { startDate: fmtExhibitionDate(startRaw), endDate: fmtExhibitionDate(endRaw) };
};

export const route: Route = {
    path: '/zz',
    categories: ['travel'],
    example: '/chinasilkmuseum/zz',
    name: 'Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.chinasilkmuseum.com/zz/list_17.aspx'],
            target: '/zz',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.chinasilkmuseum.com';
        const listUrl = `${baseUrl}/zz/list_17.aspx`;
        const museumName = namespace.zh?.name ?? namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const items = $('div.about_body div.show_info ul.ul li')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const $titleLink = $el.find('div.show_text h3.h3 a');
                const title = $titleLink.text();
                const rawHref = $titleLink.attr('href') ?? '';
                const link = new URL(rawHref, baseUrl).href;

                const $img = $el.find('a > img').first();
                const rawSrc = $img.attr('src') ?? '';
                const imgUrl = new URL(rawSrc, baseUrl).href;

                return { title, link, imgUrl };
            });

        const list = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailRes = await ofetch(item.link);
                    const $d = load(detailRes);
                    const location = $d('div.detail_text p').first().text().replace('展览地点：', '').trim();
                    const fullDuration = $d('div.detail_text p').eq(1).text().replace('展览时间：', '').trim();
                    const { startDate, endDate } = parseExhibitionDuration(fullDuration);
                    const pubDate = startDate ? parseDate(startDate) : undefined;

                    const description = renderToString(
                        <div>
                            <img src={item.imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location ?? '参考详情'}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate ?? '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate ?? '未定/常设'}
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
                    } as DataItem;
                })
            )
        );

        return {
            title: `${museumName} - 在展`,
            link: listUrl,
            language: 'zh-CN',
            item: list,
        } as Data;
    },
};
