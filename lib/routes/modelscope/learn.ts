import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/learn',
    categories: ['programming'],
    example: '/modelscope/learn',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.modelscope.cn/learn'],
        },
    ],
    name: '研习社',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.modelscope.cn/learn',
};

const uselessKey = new Set(['data-type', 'ind', 'jc', 'list', 'metadata', 'newcode', 'spacing', 'subtype', 'sz', 'szunit', 'uuid']);

function render(item) {
    if (typeof item === 'string') {
        return item;
    }

    if (Array.isArray(item)) {
        const tag = item[0];
        const attributes = item[1] || {};
        const children = item.slice(2);

        const attrs = Object.keys(attributes)
            .filter((key) => !uselessKey.has(key))
            .map((key) => `${key}="${attributes[key]}"`)
            .join(' ');

        const child = children.map((element) => render(element)).join('');

        return `<${tag} ${attrs}>${child}</${tag}>`;
    }

    return '';
}

async function handler(ctx) {
    const baseUrl = 'https://www.modelscope.cn';

    const data = await ofetch(`${baseUrl}/api/v1/dolphin/articles`, {
        method: 'POST',
        body: {
            PageNumber: 1,
            PageSize: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 18,
            Type: 2,
            Sort: 'gmt_modified',
            Query: '',
            ExcludeIds: [1558, 1436, 881, 399, 1129],
            IsCourse: [0, 1],
        },
    });

    const items = data.Data.Articles.map((i) => ({
        title: i.Title,
        description:
            (i.Content
                ? render(JSON.parse(i.Content))
                : JSON.parse(i.CourseInfo)
                      .map((info) => info.Content && render(JSON.parse(info.Content)))
                      .join('')) || i.Desc,
        author: i.CreatedBy,
        link: `${baseUrl}/learn/${i.Id}`,
        pubDate: parseDate(i.GmtCreated, 'X'),
        updated: parseDate(i.GmtModified, 'X'),
        category: [...new Set([...JSON.parse(i.Domains), ...JSON.parse(i.Subjects)])],
        image: i.ImageUrl,
    }));

    return {
        title: '研习社 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link: `${baseUrl}/learn`,
        item: items,
    };
}
