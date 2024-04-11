import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/studios',
    categories: ['programming'],
    example: '/modelscope/studios',
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
            source: ['modelscope.cn/studios'],
        },
    ],
    name: '创空间',
    maintainers: ['TonyRL'],
    handler,
    url: 'modelscope.cn/studios',
};

async function handler(ctx) {
    const baseUrl = 'https://modelscope.cn';
    const link = `${baseUrl}/studios`;

    const { data } = await got.put(`${baseUrl}/api/v1/studios`, {
        json: {
            PageSize: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 36,
            PageNumber: 1,
            SortBy: 'gmt_modified',
        },
    });

    const studios = data.Data.Studios.map((studio) => ({
        title: studio.ChineseName || studio.Name,
        description: studio.Description,
        author: studio.CreatedBy,
        link: `${link}/${studio.Path}/${studio.Name}`,
        pubDate: parseDate(studio.CreatedTime, 'X'),
        category: studio.Tags,
        slug: `/${studio.Path}/${studio.Name}`,
        coverImage: studio.CoverImage.startsWith('https://img.alicdn.com/') ? undefined : studio.CoverImage,
    }));

    const items = await Promise.all(
        studios.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${baseUrl}/api/v1/studio${item.slug}`);

                const content = data.Data.ReadMeContent;
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    coverImage: item.coverImage,
                    description: item.description,
                    md: md.render(content),
                });

                return item;
            })
        )
    );

    return {
        title: '创空间首页 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link,
        item: items,
    };
}
