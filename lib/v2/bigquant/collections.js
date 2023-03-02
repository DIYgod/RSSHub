const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const rootUrl = 'https://bigquant.com';
    const currentUrl = `${rootUrl}/wiki/api/documents.list`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            collectionId: 'c6874e5d-7f45-4e90-8cd9-5e43df3b44ef',
            direction: 'DESC',
            limit: 25,
            offset: 0,
            sort: 'publishedAt',
        },
    });

    const items = response.data.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/wiki${item.url}`,
        description: md.render(item.text),
        pubDate: parseDate(item.publishedAt),
    }));

    ctx.state.data = {
        title: '专题报告 - AI量化知识库 - BigQuant',
        link: `${rootUrl}/wiki/collections/c6874e5d-7f45-4e90-8cd9-5e43df3b44ef`,
        item: items,
    };
};
