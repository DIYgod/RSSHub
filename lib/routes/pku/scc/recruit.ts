import { escape } from 'entities';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const newsCategories = {
    xwrd: { id: 12, name: '新闻热点' },
    tzgg: { id: 13, name: '通知公告' },
    cyxx: { id: 11, name: '创业信息' },
};
const baseUrl = 'https://scc.pku.edu.cn/';

interface RecruitmentItem {
    id: string;
    title: string;
    url: string;
    startTime?: string;
}

interface RecruitmentResponse<T> {
    state: number;
    msg?: string;
    object: T;
}

interface NewsItem {
    id: string;
    title: string;
    url: string;
    isExternalLink?: boolean;
    link?: string;
    publisher?: string;
    releaseDate?: string;
    category: { name: string };
}

const getNewsItems = async (category: { id: number; name: string }) => {
    const { data }: { data: RecruitmentResponse<NewsItem[][]> } = await got.post(new URL('f/ajaxHome/ajax_cmsListByIds', baseUrl).href, {
        form: { categoryIds: `${category.id},`, number: 10 },
    });
    if (data.state !== 1 || !Array.isArray(data.object?.[0])) {
        throw new Error(`Unable to load news information: ${data.msg ?? 'unexpected response from the public API'}`);
    }
    const items = await pMap(
        data.object[0].filter((item) => item.url),
        async (item): Promise<DataItem> => {
            const link = new URL(item.isExternalLink && item.link ? item.link : item.url, baseUrl).href;
            const detail = await cache.tryGet(`pku:scc:news:v1:${item.id}`, async () => {
                const { data }: { data: RecruitmentResponse<{ article: { articleData?: { content?: string } }; fileMap?: Record<string, { fileName: string; fileUrl: string }> }> } = await got(
                    new URL('f/newsCenter/ajax_view', baseUrl).href,
                    { searchParams: { id: item.id } }
                );
                if (data.state !== 1 || !data.object?.article) {
                    throw new Error(`Unable to load news article ${link}: ${data.msg ?? 'unexpected response from the public API'}`);
                }
                const attachments = Object.values(data.object.fileMap ?? {})
                    .map((file) => `<p><a href="${escape(new URL(file.fileUrl, baseUrl).href)}">${escape(file.fileName)}</a></p>`)
                    .join('');
                return { description: (data.object.article.articleData?.content ?? '') + attachments || undefined };
            });
            return {
                title: item.title,
                link,
                pubDate: item.releaseDate ? timezone(parseDate(item.releaseDate), 8) : undefined,
                author: item.publisher || undefined,
                category: item.category?.name ? [item.category.name] : undefined,
                ...detail,
            };
        },
        { concurrency: 3 }
    );
    return { title: `北京大学学生就业指导服务中心 - ${category.name}`, link: new URL(`frontpage/pku/html/newsList.html?id=${category.id}`, baseUrl).href, item: items };
};

const getRecruitmentItems = async (positionType: number) => {
    const { data }: { data: RecruitmentResponse<RecruitmentItem[]> } = await got.post(new URL('f/ajaxHome/ajax_findRecruitmentinfoLimitList', baseUrl).href, {
        form: { num: 10, positionType },
    });
    if (data.state !== 1 || !Array.isArray(data.object)) {
        throw new Error(`Unable to load recruitment information: ${data.msg ?? 'unexpected response from the public API'}`);
    }

    const items = await pMap(
        data.object.filter((item) => item.url),
        async (item): Promise<DataItem> => {
            const link = new URL(item.url, baseUrl).href;
            const detail = await cache.tryGet(`pku:scc:recruitment:v1:${item.id}`, async () => {
                const { data }: { data: RecruitmentResponse<{ recruitmentinfo: { content?: string } }> } = await got.post(new URL('f/recruitmentinfo/ajax_show', baseUrl).href, {
                    form: { recruitmentId: item.id },
                });
                if (data.state !== 1 || !data.object?.recruitmentinfo) {
                    throw new Error(`Unable to load recruitment article ${link}: ${data.msg ?? 'unexpected response from the public API'}`);
                }
                return { description: data.object.recruitmentinfo.content };
            });
            return { title: item.title, link, pubDate: item.startTime ? timezone(parseDate(item.startTime, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `北京大学学生就业指导服务中心 - ${positionType === 1 ? '招聘信息' : '实习信息'}`,
        link: new URL(`frontpage/pku/html/recruitmentinfoList.html?type=${positionType}`, baseUrl).href,
        item: items,
    };
};

export const route: Route = {
    path: '/scc/recruit/:type?',
    categories: ['university'],
    example: '/pku/scc/recruit/zpxx',
    parameters: { type: '分区，见下表，默认请求 `zpxx`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学生就业指导服务中心',
    maintainers: ['DylanXie123'],
    handler,
    description: `| xwrd     | tzgg     | zpxx     | sxxx     | cyxx     |
| -------- | -------- | -------- | -------- | -------- |
| 新闻热点 | 通知公告 | 招聘信息 | 实习信息 | 创业信息 |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'zpxx';
    if (type === 'zpxx' || type === 'sxxx') {
        return await getRecruitmentItems(type === 'zpxx' ? 1 : 2);
    }
    const category = newsCategories[type];
    if (!category) {
        throw new InvalidParameterError(`Invalid recruitment category ${type}. Use xwrd, tzgg, zpxx, sxxx, or cyxx.`);
    }
    return await getNewsItems(category);
}
