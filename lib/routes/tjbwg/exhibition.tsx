import { load } from 'cheerio';
import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// Convert YYYY年M月D日 to YYYY-MM-DD
const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
        return;
    }

    const date = dayjs(dateString, 'YYYY年M月D日');
    return date.format('YYYY-MM-DD');
};

// used for 2026年7月1日-9月30日【在展】 or 2026年5月18日【在展】
const parseExhibitionDuration = (duration: string) => {
    if (!duration) {
        return { startDate: undefined, endDate: undefined };
    }

    const cleanStr = duration.replaceAll(/【.*?】/g, '').replaceAll(/\s+/g, ''); // Remove【在展】
    const parts = cleanStr.split('-');
    const startDateRaw = parts[0];
    let endDateRaw = parts[1];

    if (endDateRaw && !endDateRaw.includes('年')) {
        const yearMatch = startDateRaw.match(/^\d{4}年/);
        if (yearMatch) {
            endDateRaw = yearMatch[0] + endDateRaw;
        }
    }

    return { startDate: formatDate(startDateRaw), endDate: formatDate(endDateRaw) };
};

export const route: Route = {
    path: '/exhibition',
    categories: ['travel'],
    example: '/tjbwg/exhibition',
    radar: [
        {
            source: ['www.tjbwg.cn/cn/ExhibitionList.aspx'],
            target: '/exhibition',
        },
    ],
    name: 'Temporary Exhibition',
    maintainers: ['magazian'],
    handler: async () => {
        const baseUrl = 'https://www.tjbwg.cn';
        const listUrl = `${baseUrl}/cn/ExhibitionList.aspx?TypeId=10939`;
        const museumName = namespace.zh?.name ?? namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const items: DataItem[] = $('.exhList2 ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                const href = a.attr('href') ?? '';
                const link = new URL(href, `${baseUrl}/cn/`).href;
                const title = a.find('.text h3').text();
                const rawImgSrc = a.find('.img img').attr('src') ?? '';
                const imgUrl = new URL(rawImgSrc, baseUrl).href ?? '';
                const location = a
                    .find('p')
                    .first()
                    .text()
                    .trim()
                    .replace(/^地点：/, '');
                const fullDuration = a
                    .find('p')
                    .last()
                    .text()
                    .trim()
                    .replace(/^展期：/, '');

                const { startDate, endDate } = parseExhibitionDuration(fullDuration);
                const pubDate = startDate ? parseDate(startDate) : undefined;

                const description = renderToString(
                    <div>
                        <img src={imgUrl} />
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
                    title,
                    link,
                    pubDate,
                    description,
                    _extra: {
                        museumName,
                        location,
                        startDate,
                        endDate,
                    },
                } as DataItem;
            });

        return {
            title: `${museumName} - 临时展览`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
