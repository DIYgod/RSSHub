import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import { Agent } from 'undici';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route = {
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/zjmuseum/exhibition/ondisplay',
    parameters: {
        type: 'Temporary Exhibition type, supported values: ondisplay （正在展出）、forecast（即将开始）、review（展览回顾）. Default: All exhibitions (ondisplay, forecast and review).',
    },
    name: 'Temporary Exhibition',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.zjmuseum.com.cn/cn/'],
            target: '/exhibition/:type?',
        },
    ],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://www.zjmuseum.com.cn';
    const apiUrl = `${baseUrl}/api/exhibition/page`;

    const apiConfig = {
        ondisplay: { name: '正在展出', payload: { hasOpen: '1' } },
        forecast: { name: '即将开始', payload: { hasOpen: '2' } },
        review: { name: '展览回顾', payload: { hasOpen: '3' } },
    };

    const typeParam = ctx.req.param('type');
    if (typeParam && !Object.hasOwn(apiConfig, typeParam)) {
        throw new InvalidParameterError('Invalid exhibition type. Use ondisplay, forecast or review.');
    }
    const fetchTypes = typeParam ? [typeParam] : Object.keys(apiConfig);

    const museumName = namespace.zh?.name || namespace.name;

    const titleTag = typeParam ? apiConfig[typeParam]?.name : '全部展览';

    // The API server has an incompatible ECDHE implementation causing TLS handshake failures in Node 18+.
    const dispatcher = new Agent({
        connect: {
            ecdhCurve: 'X25519:P-256:P-521:P-384',
        },
    });

    try {
        const responses = await Promise.allSettled(
            fetchTypes.map(async (t) => {
                const config = apiConfig[t];

                const response = await got({
                    method: 'post',
                    url: apiUrl,
                    dispatcher,
                    json: {
                        siteId: 22,
                        type: 2,
                        pageNum: 1,
                        pageSize: 10,
                        startDate: '',
                        endDate: '',
                        hasLink: '',
                        ...config.payload,
                    },
                });

                const resData = response.data?.data;
                const list = resData?.[1] || [];

                return list.map((item) => {
                    const title = item.title;
                    const itemLink = `${baseUrl}/cn/#/Exhibition/TemporaryExhibition/${item.content_id}`;
                    const pubDate = item.create_time ? timezone(parseDate(item.create_time), 8) : undefined;
                    const startDate = item.start_time?.split('T', 1)[0] ?? '';
                    const endDate = item.end_time?.split('T', 1)[0] ?? '';
                    const location = [item.museum_area, item.address].filter(Boolean).join(' ');
                    const imgUrl = `${baseUrl}${item.cover_url}`;

                    // fullDuration is not used here due to the website only provides start and end date.
                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate || '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate || '未定/常设'}
                            </p>
                            {item.content ? raw(item.content) : null}
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
                            startDate,
                            endDate,
                        },
                    };
                });
            })
        );

        const failure = responses.find((response) => response.status === 'rejected');
        if (failure?.status === 'rejected') {
            throw failure.reason;
        }
        const items = responses.flatMap((response) => (response.status === 'fulfilled' ? response.value : []));

        return {
            title: `${museumName} - 临时展览 - ${titleTag}`,
            link: `${baseUrl}/cn/#/Exhibition/TemporaryExhibition`,
            language: 'zh-CN',
            item: items,
        };
    } finally {
        await dispatcher.close();
    }
}
