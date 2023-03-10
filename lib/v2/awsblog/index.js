const got = require('@/utils/got');

module.exports = async (ctx) => {
    const locale = ctx.params.locale ? ctx.params.locale : `zh_CN`;

    const response = await got({
        url: `https://aws.amazon.com/api/dirs/items/search?item.directoryId=blog-posts&sort_by=item.additionalFields.createdDate&sort_order=desc&size=50&item.locale=${locale}`,
    });

    const items = response.data.items;

    ctx.state.data = {
        title: `AWS Blog`,
        link: `https://aws.amazon.com/blogs/`,
        description: `AWS Blog 更新`,
        item: items && items.map((item) => ({
            title: String(item.item.additionalFields.title),
            description: String(item.item.additionalFields.postExcerpt),
            pubDate: String(item.item.dateCreated),
            link: String(item.item.additionalFields.link),
            author: String(item.item.additionalFields.contributors),
        })),
    };
};
