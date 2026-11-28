import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { formatDate, parseDate } from '@/utils/time';

import { namespace } from './namespace';
import { getDispatcher } from './tls';

interface ExhibitionItem {
    resId: string;
    name: string;
    startDate: number | '' | null;
    endDate: number | '' | null;
    exhibitLocate: string;
    exhibitIntroduce: string;
    panorama?: string;
    thumbPic: string;
}

const typeConfig = {
    topic: { code: 'L0203', title: '专题展览' },
    permanent: { code: 'L0202', title: '常设展览' },
    virtual: { code: 'L0103', title: '虚拟展厅' },
} as const;

type ExhibitionType = keyof typeof typeConfig;

const baseUrl = 'https://www.nanshanmuseum.com';
const apiHeaders = {
    'Platform-lang': '0',
    'Platform-device': '1',
};

export const route: Route = {
    path: '/exhibition/topicList/:type',
    categories: ['travel'],
    example: '/nanshanmuseum/exhibition/topicList/topic',
    parameters: {
        type: 'Exhibition type, supported values: topic（专题展览）、permanent（常设展览）、virtual（虚拟展厅）',
    },
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.nanshanmuseum.com/exhibition/topicList'],
            target: '/exhibition/topicList/topic',
        },
    ],
    handler: async (ctx: Context) => {
        const exhibitionType = ctx.req.param('type') as ExhibitionType;
        if (!Object.hasOwn(typeConfig, exhibitionType)) {
            throw new InvalidParameterError('Invalid type. Use topic, permanent or virtual.');
        }
        const { code, title: typeTitle } = typeConfig[exhibitionType];
        const museumName = namespace.zh?.name || namespace.name;
        const listUrl = `${baseUrl}/exhibition/topicList?scrollTop=0&id=${code}`;

        const response = await ofetch<{ data?: { list?: ExhibitionItem[] } }>(`${baseUrl}/api/exhibition`, {
            dispatcher: await getDispatcher(),
            query: {
                code,
                hallId: '',
                pageNum: 1,
                pageSize: 12,
                year: '',
            },
            headers: apiHeaders,
        });

        const rawList = response.data?.list ?? [];
        const items: DataItem[] = rawList.map((item) => {
            const detailLink = `${baseUrl}/exhibition/detail?id=${item.resId}&rId=${code}`;
            const link = exhibitionType === 'virtual' && item.panorama ? item.panorama : detailLink;
            const pubDate = item.startDate ? parseDate(item.startDate) : undefined;
            const startDate = pubDate ? formatDate(pubDate, 'YYYY-MM-DD', 8) : undefined;
            const endDateInstant = item.endDate ? parseDate(item.endDate) : undefined;
            const endDate = endDateInstant ? formatDate(endDateInstant, 'YYYY-MM-DD', 8) : undefined;
            const location = item.exhibitLocate;
            const imgUrl = item.thumbPic;

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
                    <p>{item.exhibitIntroduce}</p>
                </div>
            );

            return {
                title: item.name,
                link,
                guid: detailLink,
                pubDate,
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
            title: `${museumName} - ${typeTitle}`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
