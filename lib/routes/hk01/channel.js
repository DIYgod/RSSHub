const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://web-data.api.hk01.com/v2/page/category/${id}`);
    const data = response.data;
    const list = data.sections[0].items;

    ctx.state.data = {
        title: `香港01 - ${data.category.publishName}`,
        description: data.meta.metaDesc,
        link: data.category.publishUrl,
        item: list.map((item) => ({
            title: item.data.title,
            author: item.data.authors && item.data.authors.map((e) => e.publishName).join(', '),
            description: `<p>${item.data.description}…</p><img style="width: 100%" src="${item.data.mainImage.cdnUrl}" />`,
            pubDate: new Date(item.data.lastModifyTime * 1000),
            link: item.data.canonicalUrl,
        })),
    };
};
