import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/desc';

const md = MarkdownIt({
    html: true,
    linkify: true,
});
const defaultImageRenderer = md.renderer.rules.image;
md.renderer.rules.image = (tokens, index, options, env, self) => {
    const image = tokens[index].attrGet('src');
    const repositoryUrl = env?.repositoryUrl;
    if (typeof image === 'string' && image && typeof repositoryUrl === 'string' && !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(image)) {
        const query = new URLSearchParams({ Revision: 'master', FilePath: image, View: 'true' });
        tokens[index].attrSet('src', `${repositoryUrl}?${query}`);
    }
    return defaultImageRenderer ? defaultImageRenderer(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
};

export const route: Route = {
    path: '/datasets',
    categories: ['programming'],
    example: '/modelscope/datasets',
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
            source: ['modelscope.cn/datasets'],
        },
    ],
    name: '数据集',
    maintainers: ['TonyRL'],
    handler,
    url: 'modelscope.cn/datasets',
};

async function handler(ctx) {
    const baseUrl = 'https://modelscope.cn';
    const link = `${baseUrl}/datasets`;

    const { data } = await got(`${baseUrl}/api/v1/dolphin/datasets`, {
        searchParams: {
            PageSize: getRouteLimit(ctx, 36),
            PageNumber: 1,
            Target: '',
            Sort: 'gmt_modified',
        },
    });

    const datasets: Array<DataItem & { link: string; slug: string }> = data.Data.map((dataset) => ({
        title: dataset.ChineseName || dataset.Name,
        description: dataset.Description,
        author: dataset.CreatedBy,
        link: `${link}/${dataset.Namespace}/${dataset.Name}`,
        pubDate: parseDate(dataset.GmtCreate, 'X'),
        category: dataset.UserDefineTags.split(','),
        slug: `/${dataset.Namespace}/${dataset.Name}`,
    }));

    const items = await pMap(
        datasets,
        async ({ slug, ...item }) => {
            const body = await cache.tryGet(`${item.link}:readme-images`, async () => {
                const { data } = await got(`${baseUrl}/api/v1/datasets${slug}`);

                const content = (data.Data.ReadmeContent ?? '').replaceAll(/img src="(?!http)(.*?)"/g, (_match, p1) => `img src="${baseUrl}/api/v1/datasets${slug}/repo?Revision=master&FilePath=${p1}&View=true"`);
                return { content: md.render(content, { repositoryUrl: `${baseUrl}/api/v1/datasets${slug}/repo` }) };
            });
            return { ...item, description: renderDescription({ description: item.description ?? undefined, md: body.content }) };
        },
        { concurrency: 3 }
    );

    return {
        title: '数据集首页 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link,
        item: items,
    };
}
