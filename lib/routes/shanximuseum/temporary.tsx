import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route = {
    path: '/exhibition/temporary/:type?',
    categories: ['travel'],
    example: '/shanximuseum/exhibition/temporary/now&future', // default w/o type, shows all exhibitions (now, future and past)
    parameters: {
        type: 'Temporary Exhibition type, supported values: now （正在展出）、future（即将展出）、now&future（正在展出&即将展出）、past（往期展览）。Supports multiple status combinations separated by &, + or , (e.g., now&future). Default: All exhibitions (now, future and past).',
    },
    name: 'Temporary Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.shanximuseum.com.cn/sx/exhibition/temporary.html'],
            target: '/exhibition/temporary',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type');
        // Support multiple status combinations separated by &, + or , (e.g., now&future)
        const fetchTypes = typeParam ? [...new Set(typeParam.split(/[&+,|-]/))] : ['now', 'future', 'past'];

        const baseUrl = 'https://www.shanximuseum.com.cn';
        const apiUrl = `${baseUrl}/sx/exhibition`;

        const apiConfig = {
            now: { endpoint: '/temporary_now', name: '正在展出', query: {} },
            future: {
                endpoint: '/temporary_future',
                name: '即将展出',
                query: {},
            },
            past: {
                endpoint: '/temporary_list', // the same endpoint as the exhibition list page, but with different query parameters
                name: '往期展览',
                query: {
                    offset: 0,
                    count: 20,
                    year: '',
                    keyword: '',
                },
            },
        };

        const museumName = namespace.zh?.name || namespace.name;

        const titleTag = fetchTypes.length === 3 ? '全部展览' : fetchTypes.map((t) => apiConfig[t as keyof typeof apiConfig]?.name).join(' & ');

        const responses = await Promise.all(
            fetchTypes.map(async (t) => {
                const config = apiConfig[t as keyof typeof apiConfig];

                // add trycatch to prevent one failed request, espacially for now/future exhibition.
                try {
                    const response = await got({
                        method: 'get',
                        url: `${apiUrl}${config.endpoint}`,
                        searchParams: {
                            ...config.query,
                            _: Date.now(),
                        },
                    });

                    const resData = response.data?.data; // The actual data is nested under the 'data' property in the response
                    const list = Array.isArray(resData?.list) ? resData.list : []; // resData may be undefined or not an array, resDate.list is an array

                    return list.map((item) => {
                        const title = item.title;
                        const itemLink = item.fullurl;
                        const pubDate = timezone(parseDate(item.publishtime * 1000)); // Unix timestamp in seconds, convert to milliseconds
                        const startDate = item.start_time.split(' ', 1)[0];
                        const endDate = item.end_time.split(' ', 1)[0];
                        const fullDuration = item.display_time;
                        const location = item.area;
                        const imgUrl = `${baseUrl}${item.image}`;

                        const description = renderToString(
                            <div>
                                <img src={imgUrl} />
                                <br />
                                <p>
                                    <b>地点：</b>
                                    {location || '参考展览图片'}
                                    {/* location is only defined on the exhibition poster, cannot fetch directly from the website */}
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
                            link: itemLink,
                            pubDate,
                            description,
                            // For further .ics file processing
                            _extra: {
                                museumName,
                                title,
                                location,
                                startDate, // format: YYYY-MM-DD or '未定/常设'
                                endDate, // format: YYYY-MM-DD or '未定/常设'
                                itemLink,
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
            link: `${baseUrl}/sx/exhibition/temporary.html`,
            language: 'zh-CN',
            item: items,
        };
    },
};
