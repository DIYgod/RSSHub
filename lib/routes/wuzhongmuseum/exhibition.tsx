import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const callCloudApi = async (path: string) => {
    const res = await ofetch('', {
        baseURL: 'https://tcb-api.tencentcloudapi.com/web?env=wzmuse-4gcvvt77cf4e3c3e',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Origin: 'https://www.wuzhongmuseum.com',
            Referer: 'https://www.wuzhongmuseum.com/',
        },
        body: {
            action: 'functions.invokeFunction',
            dataVersion: '2020-01-10',
            env: 'wzmuse-4gcvvt77cf4e3c3e',
            function_name: 'portal-api',
            request_data: JSON.stringify({
                httpMethod: 'GET',
                path: `/v1${path}`,
                headers: {
                    'wzmuseum-dlj-portal-id': 'd6b23bdd639acd7d0018a893072234ab',
                },
            }),
        },
    });
    return JSON.parse(res.data.response_data);
};

export const route: Route = {
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/wuzhongmuseum/exhibition',
    parameters: {
        type: 'Exhibition type, supported values: short (特别展览), long (常设展览), online (线上展览). Default: all exhibitions.',
    },
    name: 'Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.wuzhongmuseum.com/portal/exhibition'],
            target: '/exhibition',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');
        const fetchTypes = typeParam ? [typeParam] : ['short', 'long', 'online'];

        const typeConfig = {
            short: '特别展览',
            long: '常设展览',
            online: '线上展览',
        };

        const museumName = namespace.zh?.name || namespace.name;
        const titleTag = fetchTypes.length === 3 ? '展览' : typeConfig[fetchTypes[0]];

        const lists = await Promise.all(
            fetchTypes.map(async (t) => {
                const res = await callCloudApi(`/exhibition?type=${t}&current=1&pageSize=20`);
                return res?.data?.list || [];
            })
        );

        const list = lists.flat();

        const items = list.map((item) => {
            // online exhit has VR link, for others, itemLink and guid share the same link.
            const itemLink = item.external_url ?? `https://www.wuzhongmuseum.com/portal/exhibition/content?id=${item._id}`;
            const guid = `https://www.wuzhongmuseum.com/portal/exhibition/content?id=${item._id}`;

            const title = item.name;
            const pubDate = parseDate(item.created_at * 1000);
            const startDate = item.start_time ? dayjs(item.start_time * 1000).format('YYYY-MM-DD') : undefined;
            const endDate = item.end_time ? dayjs(item.end_time * 1000).format('YYYY-MM-DD') : undefined;
            const location = item.address;
            const imgUrl = item.cover;

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
                title,
                link: itemLink,
                guid,
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
            title: `${museumName} - ${titleTag}`,
            link: 'https://www.wuzhongmuseum.com/portal/exhibition',
            language: 'zh-CN',
            item: items,
        };
    },
};
