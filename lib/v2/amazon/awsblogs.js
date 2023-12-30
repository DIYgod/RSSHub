const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const locale = ctx.params.locale ?? 'zh_CN';

    const response = await got({
        url: `https://aws.amazon.com/api/dirs/items/search?item.directoryId=blog-posts&sort_by=item.additionalFields.createdDate&sort_order=desc&size=50&item.locale=${locale}`,
    });

    const items = response.data.items;

    ctx.state.data = {
        title: 'AWS Blog',
        link: 'https://aws.amazon.com/blogs/',
        description: 'AWS Blog 更新',
        item:
            items &&
            items.map((item) => ({
                title: item.item.additionalFields.title,
                description: item.item.additionalFields.postExcerpt,
                pubDate: parseDate(item.item.dateCreated),
                link: item.item.additionalFields.link,
                author: item.item.additionalFields.contributors,
            })),
    };
};
