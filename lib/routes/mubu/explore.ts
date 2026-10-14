import { load } from 'cheerio';
import { escapeAttribute } from 'entities';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/explore/:category?/:title?',
    categories: ['study'],
    example: '/mubu/explore/2/读书笔记',
    parameters: { category: '分类 id', title: '显示标题' },
    name: '精选社区',
    maintainers: ['laampui', 'nczitzk'],
    handler,
};

const rootUrl = 'https://mubu.com';
const apiUrl = 'https://api2.mubu.com';

interface ExploreDoc {
    exploreDocId: string;
    title: string;
    userInfo: { userName: string };
    submitTime: number;
}

const renderNodes = (nodes) =>
    `<ul>${nodes
        .map((node) => {
            let ele = '';
            if (Array.isArray(node.children)) {
                ele = renderNodes(node.children);
            }
            if (Array.isArray(node.images)) {
                ele += node.images
                    .map((pic) => {
                        const imageUrl = pic.uri || pic.url;
                        return imageUrl ? `<div style="text-align: center;"><img src="${escapeAttribute(new URL(imageUrl, `${apiUrl}/v3/`).href)}" style="max-width: 100%;object-fit: contain;" /></div>` : '';
                    })
                    .join('');
            }

            return `<li>${node.text}${ele}</li>`;
        })
        .join('')}</ul>`;

async function handler(ctx: Context) {
    const { category = '0', title = '' } = ctx.req.param();

    const response = await ofetch<{ data: { rows: ExploreDoc[] } }>(`${apiUrl}/v3/api/explore/get_explore_doc_list`, {
        method: 'POST',
        body: {
            categoryId: category,
            pageSize: '20',
            start: '',
            type: category === '0' ? 0 : 1,
        },
    });

    const items = await pMap(
        response.data.rows.slice(0, 20),
        async (item) => {
            const link = `${rootUrl}/explore/${item.exploreDocId}`;

            const details = await cache.tryGet(`mubu:definition:${link}`, async () => {
                const detailResponse = await ofetch(`${apiUrl}/v3/api/explore/get`, {
                    method: 'POST',
                    body: {
                        exploreDocId: item.exploreDocId,
                    },
                });
                const content = JSON.parse(detailResponse.data.definition);

                const $ = load(renderNodes(content.nodes));
                $('.bold').css('font-weight', 'bold');
                $('.text-color-red').css('color', '#dc2d1e');

                return {
                    title: item.title,
                    author: item.userInfo.userName,
                    pubDate: parseDate(item.submitTime),
                    link,
                    description: $('body').html(),
                };
            });
            return { ...details, title: item.title, author: item.userInfo.userName, pubDate: parseDate(item.submitTime), link };
        },
        { concurrency: 3 }
    );

    return {
        title: `${title ? `${title} - ` : ''}幕布精选社区`,
        link: `${rootUrl}/explore?categoryId=${category}`,
        item: items,
    };
}
