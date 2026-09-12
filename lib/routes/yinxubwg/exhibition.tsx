import { renderToString } from 'hono/jsx/dom/server';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

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

        const baseUrl = 'https://www.yinxubwg.cn';
        const apiBaseUrl = 'https://guc.yinxubwg.cn';
        const museumName = namespace.zh?.name || namespace.name;

        const typeName: Record<number, string> = {
            1: '常设展览',
            2: '临时展览',
            3: '展览回眸',
        };
        const feedTitle = typeName[exhibitionType];

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
                </div>
            );

            return {
                title: item.exhibition_name,
                link,
                pubDate: startDate ? parseDate(startDate) : undefined,
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
