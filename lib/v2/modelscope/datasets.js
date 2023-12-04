const got = require('@/utils/got');
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://modelscope.cn';
    const link = `${baseUrl}/datasets`;

    const { data } = await got(`${baseUrl}/api/v1/dolphin/datasets`, {
        searchParams: {
            PageSize: ctx.query.limit ? parseInt(ctx.query.limit) : 36,
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
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(`${baseUrl}/api/v1/datasets${item.slug}`);

                const content = data.Data.ReadmeContent.replace(/img src="(?!http)(.*?)"/g, `img src="${baseUrl}/api/v1/datasets${item.slug}/repo?Revision=master&FilePath=$1&View=true"`);
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    description: item.description,
                    md: md.render(content),
                });
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '数据集首页 · 魔搭社区',
        description: 'ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link,
        item: items,
    };
};
