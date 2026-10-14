import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

function parseCalendarDate(sourceDate: string | undefined): Date | undefined {
    if (typeof sourceDate !== 'string' || !sourceDate.trim()) {
        return;
    }

    const value = sourceDate.trim();
    const isCalendarDay = /^\d{4}-\d{2}-\d{2}$/.test(value);
    // UTC midnight represents the calendar day, not a source publication instant.
    const date = parseDate(isCalendarDay ? `${value}T00:00:00Z` : value);
    if (!Number.isFinite(date.getTime()) || (isCalendarDay && date.toISOString().slice(0, 10) !== value)) {
        return;
    }

    return date;
}

export const route = {
    path: '/exhibitionIndex/:type',
    categories: ['travel'],
    example: '/yinxubwg/exhibitionIndex/2',
    parameters: {
        type: 'Exhibition type. Supported values: `1` (Permanent Exhibition), `2` (Temporary Exhibition), `3` (Past Exhibitions).',
    },
    name: 'Exhibition Information',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.yinxubwg.cn/yxgw/exhibitionIndex'],
            target: '/exhibitionIndex/:type',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');
        const exhibitionType = Number(typeParam);
        if (![1, 2, 3].includes(exhibitionType)) {
            throw new InvalidParameterError('Invalid exhibition type: use 1, 2, or 3');
        }

        const baseUrl = 'https://www.yinxubwg.cn';
        const apiBaseUrl = 'https://guc.yinxubwg.cn';
        const museumName = namespace.zh?.name || namespace.name;

        const typeName = new Map([
            [1, '常设展览'],
            [2, '临时展览'],
            [3, '展览回眸'],
        ]);
        const feedTitle = typeName.get(exhibitionType);

        const response = await ofetch(`${apiBaseUrl}/gwebapi/exhibition/list`, {
            query: {
                p: 'w',
                exhibition_type: exhibitionType,
                language: 1,
                page: 1,
                limit: 10,
            },
        });

        const list: Array<{
            exhibition_id: number;
            exhibition_name: string;
            list_img: string;
            place: string;
            start_date_format: string;
            end_date_format: string;
            intro?: string;
        }> = response.data?.list ?? [];

        const items = list.map((item) => {
            const link = `${baseUrl}/yxgw/exhibitionIndex/exhibitionDetail?exhibitionId=${item.exhibition_id}`;
            const imgUrl = item.list_img;
            const startDate = item.start_date_format;
            const endDate = item.end_date_format;
            const location = item.place;

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
                    {typeof item.intro === 'string' && item.intro.trim() ? <p style={{ whiteSpace: 'pre-wrap' }}>{item.intro}</p> : undefined}
                </div>
            );

            return {
                title: item.exhibition_name,
                link,
                pubDate: parseCalendarDate(startDate),
                description,
                _extra: {
                    museumName,
                    location,
                    startDate,
                    endDate,
                },
            };
        });

        return {
            title: `${museumName} - ${feedTitle}`,
            link: `${baseUrl}/yxgw/exhibitionIndex/exhibitionList?type=${exhibitionType}`,
            language: 'zh-CN',
            item: items,
        };
    },
};
