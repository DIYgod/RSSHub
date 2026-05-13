import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

export const route: Route = {
    path: '/display/offline-exhibit',
    categories: ['travel'],
    example: '/shanghaimuseum/display/offline-exhibit?type=PAST',
    parameters: {
        type: 'Exhibition type, supported values: PRESENT (当期展览) | PAST (往期展览). Default: PRESENT.',
    },
    // Use SHM English version channel name
    name: 'Special Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.shanghaimuseum.net/mu/frontend/pg/display/offline-exhibit'],
            target: '/display/offline-exhibit',
        },
    ],
    handler: async (ctx) => {
        const type = ctx.req.query('type');

        // Default to PRESENT if type is not provided or invalid
        const exhibitionType = type === 'PAST' ? 'PAST' : 'PRESENT';

        const baseUrl = 'https://www.shanghaimuseum.net';
        const apiUrl = `${baseUrl}/mu/frontend/pg/display/search-exhibit`;

        const response = await got.post(apiUrl, {
            json: {
                limit: 20,
                page: 1,
                params: {
                    exhibitTypeCode: 'OFFLINE_EXHIBITION',
                    langCode: 'CHINESE',
                    offlineExhibitionType: exhibitionType,
                },
            },
        });

        const museumName = namespace.zh?.name || namespace.name;
        const list = response.data.data || [];

        const items = list.map((item) => {
            const title = item.name;
            const itemLink = `${baseUrl}/mu/frontend/pg/article/id/${item.code}`;
            const imgUrl = item.picPath ? `${baseUrl}/${item.picPath}` : '';
            const location = item.exhibitPlace || '上海博物馆';
            const pubDate = parseDate(item.issueTime);

            const fullDuration = item.exhibitDateRange || '';
            const [startDate, endDate] = fullDuration.includes(' - ') ? fullDuration.split(' - ').map((s) => s.trim()) : [fullDuration, ''];

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
                        {location}
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

        return {
            title: `${museumName} - 特别展览 - ${exhibitionType === 'PAST' ? '往期展览' : '当期展览'}`,
            link: `${baseUrl}/mu/frontend/pg/display/offline-exhibit`,
            language: 'zh-CN',
            item: items,
        };
    },
};
