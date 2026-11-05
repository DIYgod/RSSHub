import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const route: Route = {
    path: '/models',
    categories: ['programming'],
    example: '/modelscope/models',
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
            source: ['modelscope.cn/models'],
        },
    ],
    name: '模型库',
    maintainers: ['TonyRL'],
    handler,
    url: 'modelscope.cn/models',
};

async function handler(ctx) {
    const baseUrl = 'https://modelscope.cn';
    const link = `${baseUrl}/models`;

    const { data } = await got.put(`${baseUrl}/api/v1/dolphin/models`, {
        json: { PageSize: getRouteLimit(ctx, 36), PageNumber: 1, SortBy: 'GmtModified', Target: '', SingleCriterion: [] },
    });

    const models: Array<DataItem & { link: string; slug: string }> = data.Data.Model.Models.map((model) => ({
        title: model.ChineseName || model.Name,
        description: model.Description,
        author: model.Organization.FullName,
        link: `${link}/${model.Path}/${model.Name}`,
        pubDate: parseDate(model.CreatedTime, 'X'),
        category: [...new Set([...(model.Tasks ?? []).map((task) => task.ChineseName), ...(model.Tags ?? [])])],
        slug: `/${model.Path}/${model.Name}`,
    }));

    const items = await pMap(
        models,
        async ({ slug, ...item }) => {
            const body = await cache.tryGet(`${item.link}:readme`, async () => {
                const { data } = await got(`${baseUrl}/api/v1/models${slug}`);

                const content = data.Data.ReadMeContent.replaceAll(/img src="(?!http)(.*?)"/g, (_match, p1) => `img src="${baseUrl}/api/v1/models${slug}/repo?Revision=master&FilePath=${p1}&View=true"`);
                return { content: md.render(content) };
            });
            return { ...item, description: body.content };
        },
        { concurrency: 3 }
    );

    return {
        title: '模型库首页 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link,
        item: items,
    };
}
