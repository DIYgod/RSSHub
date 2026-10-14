import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const callCloudApi = async <T,>(path: string): Promise<{ data: T }> => {
    const res = await ofetch<{ data: { response_data: string } }>('', {
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

interface Exhibition {
    _id: string;
    name: string;
    external_url?: string;
    created_at?: number;
    start_time?: number;
    end_time?: number;
    address?: string;
    cover?: string;
    content?: string;
}

interface Chapter {
    name: string;
    content?: string;
}

function parseEpochDate(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return;
    }
    const date = parseDate(value * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseEventDate(value?: number) {
    const date = parseEpochDate(value);
    return date ? dayjs(date).format('YYYY-MM-DD') : undefined;
}

function exhibitionLink(value: string | undefined, fallback: string) {
    if (value) {
        try {
            const link = new URL(value);
            if (['http:', 'https:'].includes(link.protocol)) {
                return link.href;
            }
        } catch {
            // Use the source exhibition identity if its external URL is invalid.
        }
    }
    return fallback;
}

interface Download {
    name: string;
    src: string;
}

async function fetchExhibitionBody(id: string) {
    const detail = await callCloudApi<Exhibition>(`/exhibition/${id}`);
    const chapters = await callCloudApi<Chapter[]>(`/exhibition/chapter/all?refId=${id}`);
    const downloads = await callCloudApi<Download[]>(`/download/all?module=exhibition&moduleId=${id}`);
    return { content: detail.data.content || '', chapters: chapters.data || [], downloads: downloads.data || [] };
}

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

        if (typeParam && !Object.hasOwn(typeConfig, typeParam)) {
            throw new Error('Unsupported exhibition type. Use short, long, or online.');
        }

        const museumName = namespace.zh?.name || namespace.name;
        const titleTag = fetchTypes.length === 3 ? '展览' : typeConfig[fetchTypes[0]];

        const lists = await Promise.all(
            fetchTypes.map(async (t) => {
                const res = await callCloudApi<{ list: Exhibition[] }>(`/exhibition?type=${t}&current=1&pageSize=20`);
                return res?.data?.list || [];
            })
        );

        const list = lists.flat();

        const items = await pMap(
            list,
            async (item) => {
                // online exhit has VR link, for others, itemLink and guid share the same link.
                const guid = `https://www.wuzhongmuseum.com/portal/exhibition/content?id=${item._id}`;
                const itemLink = exhibitionLink(item.external_url, guid);

                const detail = await cache.tryGet(`${guid}:body`, () => fetchExhibitionBody(item._id));
                const title = item.name;
                const pubDate = parseEpochDate(item.created_at);
                const startDate = parseEventDate(item.start_time);
                const endDate = parseEventDate(item.end_time);
                const location = item.address;
                const imgUrl = item.cover;

                const description = renderToString(
                    <div>
                        {imgUrl && (
                            <>
                                <img src={imgUrl} />
                                <br />
                            </>
                        )}
                        {location && (
                            <p>
                                <b>地点：</b>
                                {location}
                            </p>
                        )}
                        {startDate && (
                            <p>
                                <b>开展：</b>
                                {startDate}
                            </p>
                        )}
                        {endDate && (
                            <p>
                                <b>闭展：</b>
                                {endDate}
                            </p>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: detail.content }} />
                        {detail.chapters.map((chapter) => (
                            <section>
                                <h3>{chapter.name}</h3>
                                <div dangerouslySetInnerHTML={{ __html: chapter.content || '' }} />
                            </section>
                        ))}
                        {detail.downloads.map((download) => (
                            <p>
                                <a href={download.src}>{download.name}</a>
                            </p>
                        ))}
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
            },
            { concurrency: 3 }
        );

        return {
            title: `${museumName} - ${titleTag}`,
            link: 'https://www.wuzhongmuseum.com/portal/exhibition',
            language: 'zh-CN',
            item: items,
        };
    },
};
