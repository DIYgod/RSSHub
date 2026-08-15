import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route = {
    path: '/exhibition/temporary/:type?',
    categories: ['travel'],
    example: '/lnmuseum/exhibition/temporary/now',
    params: {
        type: 'Temporary Exhibition type, supported values: now （正在展出）、past（展览回顾）。Default: All temporary exhibitions (now and past).',
    },
    name: 'Temporary Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.lnmuseum.com.cn'],
            target: '/exhibition/temporary',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');

        const fetchTypes = typeParam && (typeParam === 'now' || typeParam === 'past') ? [typeParam] : ['now', 'past'];

        const baseUrl = 'https://www.lnmuseum.com.cn';
        const apiUrl = `${baseUrl}/singleMuseum/applet/exhibition/zlList`;

        const apiConfig = {
            now: { typeId: '1', name: '正在展出' },
            past: { typeId: '3', name: '展览回顾' },
        };

        const museumName = namespace.zh?.name || namespace.name;
        const titleTag = fetchTypes.length === 2 ? '全部展览' : apiConfig[fetchTypes[0] as keyof typeof apiConfig]?.name;

        const responses = await Promise.all(
            fetchTypes.map(async (t) => {
                const config = apiConfig[t as keyof typeof apiConfig];

                try {
                    const response = await got({
                        method: 'get',
                        url: apiUrl,
                        searchParams: {
                            currentPage: 1,
                            size: 9,
                            type: config.typeId,
                            _t: Date.now(),
                        },
                    });

                    const list = response.data?.result?.records || [];

                    return list.map((item) => {
                        const title = item.name;
                        const itemLink = `${baseUrl}/#/exhibition/detail?id=${item.id}&pageType=1`;
                        const pubDate = timezone(parseDate(item.createTime), 8);
                        const startDate = item.beginTime;
                        const endDate = item.endTime;
                        const location = item.address;
                        const imgUrl = `${baseUrl}${item.mainPic}`;

                        const description = renderToString(
                            <div>
                                <img src={imgUrl} />
                                <br />
                                <p>
                                    <b>地点：</b>
                                    {location || '参考展览图片'}
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
                            pubDate,
                            description,
                            // For further .ics file processing
                            _extra: {
                                museumName,
                                location,
                                startDate, // format: YYYY-MM-DD or '未定/常设'
                                endDate, // format: YYYY-MM-DD or '未定/常设'
                            },
                        };
                    });
                } catch {
                    return [];
                }
            })
        );

        const items = responses.flat();

        return {
            title: `${museumName} - 临时展览 - ${titleTag}`,
            link: `${baseUrl}/#/exhibition?type=1`,
            language: 'zh-CN',
            item: items,
        };
    },
};
