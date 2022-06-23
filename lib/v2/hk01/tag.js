const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://web-data.api.hk01.com/v2/page/tag/${id}`);
    const data = response.data;
    const list = data.articles;

    ctx.state.data = {
        title: `香港01 - ${data.tag.tagName}`,
        description: data.meta.metaDesc,
        link: data.tag.publishUrl,
        item: list.map((item) => ({
            title: item.data.title,
            author: item.data.authors && item.data.authors.map((e) => e.publishName).join(', '),
            description: `<p>${item.data.description}</p><img style="width: 100%" src="${item.data.mainImage.cdnUrl}" />`,
            pubDate: parseDate(item.data.lastModifyTime * 1000),
            link: item.data.canonicalUrl,
        })),
    };
};
