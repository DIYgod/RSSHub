import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import * as path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://modelscope.cn';
    const link = `${baseUrl}/datasets`;

    const { data } = await got(`${baseUrl}/api/v1/dolphin/datasets`, {
        searchParams: {
            PageSize: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 36,
            PageNumber: 1,
            Target: '',
            Sort: 'gmt_modified',
        },
    });

    const datasets = data.Data.map((dataset) => ({
        title: dataset.ChineseName,
        description: dataset.Description,
        author: dataset.CreatedBy,
        link: `${link}/${dataset.Namespace}/${dataset.Name}`,
        pubDate: parseDate(dataset.GmtCreate, 'X'),
        category: dataset.UserDefineTags.split(','),
        slug: `/${dataset.Namespace}/${dataset.Name}`,
    }));

    const items = await Promise.all(
        datasets.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${baseUrl}/api/v1/datasets${item.slug}`);

                const content = data.Data.ReadmeContent.replaceAll(/img src="(?!http)(.*?)"/g, `img src="${baseUrl}/api/v1/datasets${item.slug}/repo?Revision=master&FilePath=$1&View=true"`);
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    description: item.description,
                    md: md.render(content),
                });
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '数据集首页 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link,
        item: items,
    });
};
