const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { repo, product, type } = ctx.params;

    const namespace = [repo, product, type].filter((val) => val).join('/');

    const data = await got.get(`https://mcr.microsoft.com/api/v1/catalog/${namespace}/tags`);
    const metadata = await got.get(`https://mcr.microsoft.com/api/v1/catalog/${namespace}/details`);
    const tags = data.data;

    ctx.state.data = {
        title: `${namespace} tags`,
        description: String(metadata.shortDescription),
        link: `https://mcr.microsoft.com/en-us/product/${namespace}`,
        language: 'en',
        item: tags.map((item) => ({
            title: `${namespace}:${item.name}@${item.operatingSystem}/${item.architecture} was updated`,
            description: `${namespace}:${item.name}@${item.operatingSystem}/${item.architecture} was updated, size: ${item.size}, digest: ${item.digest}`,
            author: 'mcr',
            pubDate: parseDate(item.lastModifiedDate),
            guid: `${namespace}:${item.name}@${item.operatingSystem}/${item.architecture}:${item.digest}`,
        })),
    };
};
