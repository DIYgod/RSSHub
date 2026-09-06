import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/explore/:category?/:title?',
    categories: ['study'],
    example: '/mubu/explore/16/读书笔记',
    parameters: { category: '分类 id', title: '显示标题' },
    name: '精选社区',
    maintainers: ['laampui', 'nczitzk'],
    handler,
};

const rootUrl = 'https://mubu.com';
const apiUrl = 'https://api2.mubu.com';

const renderNodes = (nodes) =>
    `<ul>${nodes
        .map((node) => {
            let ele = '';
            if (Array.isArray(node.children)) {
                ele = renderNodes(node.children);
            }
            if (Array.isArray(node.images)) {
                ele += node.images.map((pic) => `<div style="text-align: center;"><img src="${apiUrl}/v3/${pic.url}" style="max-width: 100%;object-fit: contain;" /></div>`).join('');
            }

            return `<li>${node.text}${ele}</li>`;
        })
        .join('')}</ul>`;

async function handler(ctx: Context) {
    const { category = '0', title = '' } = ctx.req.param();

    const response = await ofetch(`${apiUrl}/v3/api/explore/get_explore_doc_list`, {
        method: 'POST',
        body: {
            categoryId: '3',
            pageSize: '20',
            start: '',
            type: category === '0' ? 0 : 1,
        },
    });

    const items = await Promise.all(
        response.data.rows.slice(0, 20).map((item) => {
            const link = `${rootUrl}/explore/${item.exploreDocId}`;

            return cache.tryGet(link, async () => {
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
                    author: item.userName,
                    pubDate: parseDate(item.submitTime),
                    link,
                    description: $('body').html(),
                };
            });
        })
    );

    return {
        title: `${title ? `${title} - ` : ''}幕布精选社区`,
        link: `${rootUrl}/explore?categoryId=${category}`,
        item: items,
    };
}
