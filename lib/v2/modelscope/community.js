const cheerio = require('cheerio');
const got = require('@/utils/got');
const path = require('path');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://community.modelscope.cn';

    const { data } = await got.post(`${baseUrl}/v1/namespace_page/article`, {
        json: { id: 142373, notInMediaAidList: [], pageNum: 1, pageSize: ctx.query.limit ? parseInt(ctx.query.limit) : 30 },
    });

    const articles = data.data.content.map((c) => ({
        title: c.content.name,
        description: c.content.desc,
        author: c.nickname,
        link: `${baseUrl}/${c.content.id}.html`,
        pubDate: timezone(parseDate(c.content.createdTime), 8),
        category: c.content.externalData.tags.map((t) => t.name),
        thumb: c.content.thumb,
    }));

    const items = await Promise.all(
        articles.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);

                const $ = cheerio.load(data);
                const initialData = JSON.parse(
                    $('script')
                        .text()
                        .match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/)[1]
                );

                item.description = art(path.join(__dirname, 'templates/community.art'), {
                    thumb: item.thumb,
                    quote: item.description,
                    content: initialData.pageData.detail.ext.content,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'ModelScope魔搭社区-DevPress官方社区',
        description: 'ModelScope魔搭社区 DevPress官方社区-ModelScope旨在打造下一代开源的模型即服务共享平台，为泛AI开发者提供灵活、易用、低成本的一站式模型服务产品，让模型应用更简单。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link: baseUrl,
        item: items,
    };
};
