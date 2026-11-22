import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://job.xjtu.edu.cn';
const arr = {
    zxgg: '中心公告',
    xds: '选调生',
    zddw: '重点单位',
    gjzz: '国际组织',
    cxcy: '创新创业',
    jysx: '就业实习',
};
interface Article {
    id: string;
    title: string;
    url: string;
    releaseDate: string;
    updateDate: string;
    publisher: string;
    category: {
        name: string;
    };
    articleData: {
        content: string;
    };
}
export const route: Route = {
    path: '/job/:subpath?',
    categories: ['university'],
    example: '/xjtu/job/zxgg',
    parameters: { subpath: '栏目类型，默认请求`zxgg`，详见下方表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '就业创业中心',
    maintainers: ['DylanXie123'],
    handler,
    description: `栏目类型

| 中心公告 | 选调生 | 重点单位 | 国际组织 | 创新创业 | 就业实习 |
| -------- | ------ | -------- | -------- | -------- | -------- |
| zxgg     | xds    | zddw     | gjzz     | cxcy     | jysx     |`,
};
async function handler(ctx) {
    const subpath = ctx.req.param('subpath') ?? 'zxgg';
    if (!Object.hasOwn(arr, subpath)) {
        throw new InvalidParameterError('Unknown employment category. Please use zxgg, xds, zddw, gjzz, cxcy, or jysx.');
    }
    const sourceContent1 = await ofetch(baseUrl);
    const $ = load(sourceContent1);
    const categoryTemplate = load($(`script#${subpath}`).text());
    const categoryHref = categoryTemplate('a.more_btn').attr('href');
    if (!categoryHref) {
        throw new Error('The employment website did not provide a public category link. Please check whether the source has changed.');
    }
    const listUrl = new URL(categoryHref, baseUrl);
    const categoryId = listUrl.searchParams.get('id');
    if (!categoryId) {
        throw new Error('The employment website did not provide a category ID. Please check whether the source has changed.');
    }
    const response = await ofetch<{
        state: number;
        object?: Article[][];
    }>(`${baseUrl}/f/ajaxHome/ajax_cmsListByIds`, {
        method: 'POST',
        body: new URLSearchParams({ categoryIds: `${categoryId},`, number: '4' }),
    });
    const list = response.object?.[0];
    if (response.state !== 1 || !Array.isArray(list)) {
        throw new Error('The employment website did not return a public article list. Please retry later.');
    }
    const items = await pMap(
        list,
        async (article) => {
            const item: DataItem & {
                link: string;
            } = {
                title: article.title,
                link: new URL(article.url, baseUrl).href,
                pubDate: parseDate(article.releaseDate, 8),
                updated: parseDate(article.updateDate, 8),
                author: article.publisher,
                category: [article.category.name],
            };
            if (!item.link.startsWith(`${baseUrl}/`)) {
                return item;
            }
            const detail = await cache.tryGet(`xjtu:job:content:v1:${item.link}`, async () => {
                const detail = await ofetch<{
                    object: {
                        article: Article;
                        fileMap?: Array<{
                            fileUrl: string;
                            fileName: string;
                        }>;
                    };
                }>(`${baseUrl}/f/newsCenter/ajax_view`, {
                    query: { id: article.id },
                });
                const content = detail.object.article.articleData.content;
                const attachments = detail.object.fileMap?.map((file) => ({ fileUrl: new URL(file.fileUrl, baseUrl).href, name: file.fileName })) ?? [];
                return { description: content + renderToString(<XjtuAttachments items={attachments} />) };
            });
            return { ...item, description: detail.description };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: `西安交通大学学生就业创业信息网 - ${arr[subpath]}`,
        link: listUrl.href,
        item: items,
    };
}
const XjtuAttachments = ({
    items,
}: {
    items: Array<{
        fileUrl: string;
        name: string;
    }>;
}) => (
    <>
        {items.map((item) => (
            <>
                <a href={item.fileUrl} rel="noreferrer">
                    {item.name}
                </a>
                <br />
            </>
        ))}
    </>
);
