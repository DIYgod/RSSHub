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
        let typeParam = ctx.req.param('type')?.toLowerCase();

        let fetchTypes = ['now', 'future', 'past'];

        if (typeParam) {
            // replace list or offset with past to support old links like /temporary/list or /temporary/offset
            typeParam = typeParam.replaceAll(/list|offset/g, 'past');

            // support /now&future, /now+future, /now,future
            const requestedTypes = typeParam.split(/[&+,|-]/);

            const validTypes = requestedTypes.filter((t) => ['now', 'future', 'past'].includes(t));

            if (validTypes.length > 0) {
                fetchTypes = [...new Set<string>(validTypes)];
            }
        }

        const baseUrl = 'https://www.shanximuseum.com.cn';
        const apiUrl = `${baseUrl}/sx/exhibition`;

        const apiConfig = {
            now: { endpoint: '/temporary_now', name: '正在展出', query: {} },
            future: { endpoint: '/temporary_future', name: '即将展出', query: {} },
            past: {
                endpoint: '/temporary_list',
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

        let titleTag = '全部展览';

        // combine titletag with & if user specified type
        if (typeParam && fetchTypes.length > 0) {
            titleTag = fetchTypes.map((t) => apiConfig[t].name).join(' & ');

            // all 3 titletag combination should be named as default
            if (fetchTypes.length === 3) {
                titleTag = '全部展览';
            }
        }

        const responses = await Promise.all(
            fetchTypes.map(async (t) => {
                const config = apiConfig[t];

                const response = await got({
                    method: 'get',
                    url: `${apiUrl}${config.endpoint}`,
                    searchParams: {
                        ...config.query,
                        _: Date.now(),
                    },
                });

                let list = response.data;
                if (list && list.data) {
                    list = list.data;
                }

                if (list && !Array.isArray(list)) {
                    if (list.list && Array.isArray(list.list)) {
                        list = list.list;
                    } else if (list.rows && Array.isArray(list.rows)) {
                        list = list.rows;
                    }
                }

                if (!Array.isArray(list)) {
                    list = [];
                }

                return list.map((item) => {
                    const title = item.title;
                    const itemLink = item.fullurl || `${baseUrl}${item.url}`;
                    const pubDate = timezone(parseDate(item.publishtime * 1000), +8);
                    const startDate = item.start_time ? item.start_time.split(' ')[0] : '';
                    const endDate = item.end_time ? item.end_time.split(' ')[0] : '';
                    const fullDuration = item.display_time || '';
                    const location = item.area || '';
                    const imgUrl = item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`;

                    const description = renderToString(
                        <div>
                            {imgUrl && (
                                <>
                                    <img src={imgUrl} />
                                    <br />
                                </>
                            )}
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
                                    <small>
                                        原始展期：
                                        {fullDuration.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                <br />
                                            </span>
                                        ))}
                                    </small>
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
            })
        );

        const items = responses.flat();

        // return information if there is no exhibition available to fix "route is empty" issue.
        if (items.length === 0) {
            items.push({
                title: `当前暂无${titleTag}`,
                description: '<p>官方目前没有提供相关的展览数据。</p>',
                link: `${baseUrl}/sx/exhibition/temporary.html`,
                // fixed guid
                guid: `shanxi-museum-empty-${fetchTypes.join('-')}`,
            });
        }

        return {
            title: `${museumName} - 临时展览 - ${titleTag}`,
            link: `${baseUrl}/sx/exhibition/temporary.html`,
            language: 'zh-CN',
            item: items,
        };
    },
};
